# Despliegue — SED 2.0

## Topología de producción (Parte II §21)

```
                       ┌─────────────────┐
                       │   WAF + DDoS    │
                       └────────┬────────┘
                                │
                       ┌────────▼────────┐
                       │ Load Balancer   │
                       └────────┬────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼─────┐ ┌──────▼──────┐ ┌──────▼─────┐
        │ Next.js Pod │ │ Next.js Pod │ │ Next.js Pod│
        └───────┬─────┘ └──────┬──────┘ └──────┬─────┘
                │              │               │
                └──────────────┼───────────────┘
                               │
                  ┌────────────┼─────────────┐
                  │            │             │
          ┌───────▼─────┐  ┌───▼──────┐ ┌────▼─────┐
          │ PostgreSQL  │  │  Kafka   │ │  S3/MinIO│
          │ Primary +   │  │ Cluster  │ │  Cifrado │
          │ Réplicas    │  └──────────┘ └──────────┘
          └─────────────┘
```

- 3 zonas de disponibilidad (AZ) en territorio mexicano (P-01)
- Réplica síncrona PostgreSQL primaria → secundaria
- Backup cifrado cada 15 min · retención 35 días (RPO ≤ 15 min)
- HSM/KMS en infraestructura propia para `FIELD_ENCRYPTION_KEY`

## Ambientes lógicos

| Ambiente | Datos personales | Acceso |
| --- | --- | --- |
| Producción | reales, cifrados | personal autorizado |
| Pre-producción | sintéticos | equipo CEEEY |
| Desarrollo | sintéticos / anonimizados | desarrolladores |

## Variables de entorno mínimas

```bash
DATABASE_URL=postgresql://sed:***@db.sed.yucatan.gob.mx:5432/sed?sslmode=require
SESSION_SECRET=<32 bytes random base64>
FIELD_ENCRYPTION_KEY=<32 bytes random base64 desde KMS>
EVENT_BUS_URL=kafka://broker.sed:9093?security.protocol=SSL
LOG_LEVEL=info
NODE_ENV=production
```

## Despliegue con Kubernetes (esbozo)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: sed-web }
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: sed
        image: ghcr.io/yucatan/sed:v2.0.0
        ports: [{ containerPort: 3000 }]
        envFrom: [{ secretRef: { name: sed-secrets }}]
        readinessProbe:
          httpGet: { path: /api/health, port: 3000 }
        resources:
          limits: { cpu: 1, memory: 1Gi }
```

## Continuidad de negocio

- RPO ≤ 15 min · RTO ≤ 4 h para componentes críticos (P-10)
- Failover automático entre AZ
- Plan de Recuperación de Desastres documentado y probado anualmente
- Modalidad OMR (papel) como contingencia ante caída total (ADR-006)

## Observabilidad

- Logs estructurados pino → Loki
- Métricas Prometheus → Grafana
- Trazas OpenTelemetry → Tempo
- SIEM con detección de anomalías en audit log
