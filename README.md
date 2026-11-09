# Escenarios Panel BI

Simulador interactivo de costos y ventas de un panel B2B, basado en `Costos Panel Bi.xlsx` y el documento de arquitectura de WorkforcePlus del 9 de noviembre de 2026. Publicado en https://escenarios-panel-bi.vercel.app/.

## Uso

Descarga `index.html` y ábrelo en un navegador. Funciona sin internet y no requiere instalación ni dependencias.

- Configura clientes o grupos por tamaño, cantidad y mes de incorporación.
- Ajusta 141 parámetros del Excel, consumos, soporte, licencias y reglas de costos y venta.
- Usa **Supuestos y variables** para calendario, perfiles, factores de escenarios y configuración del cloud compartido.
- Usa **Detalle de costos** para one-time, soporte, operacional, mantenimiento, inversión y licencias, con entradas editables, resultados por grupo, distribución de costos y evolución del cloud.
- Separa trabajo común de plataforma, costos por cliente y costos por capacidad.
- Compara escenarios con precios de venta fijos y observa cambios de margen, incluso pérdidas.
- Revisa costos totales y por cliente, evolución mensual, recuperación de inversión y sensibilidad.
- Guarda y compara escenarios. Exporta/importa respaldos JSON o descarga un HTML con tus cambios.

## Base del modelo

Los valores se expresan en USD, sin impuestos. Las tarifas son las del archivo de origen, sin actualización externa. La cartera inicial es un ejemplo: 5 clientes pequeños, 3 medianos y 2 grandes.

La clasificación inicial propone 2 horas comunes mensuales para cambios de API, parches y revisión de costos/respaldos, tomadas del perfil pequeño del Excel. Cada actividad se puede cambiar a trabajo individual por tamaño.

**Todo el cloud es compartido.** La base usa una RDS PostgreSQL db.t4g.large Single-AZ, un gateway EC2 Windows t3.large, un NAT con IPv4 y una imagen ETL común. El mínimo de disco RDS se aplica a la plataforma y crece con los datos agregados. Fargate, tráfico, logs y secretos suman consumos generados por los clientes dentro de los servicios compartidos. El tráfico NAT incluye API entrante y Power BI saliente. El total cloud se cobra una sola vez y se reparte por igual solo para mostrar costos por cliente.

El perfil RDS y las cantidades de recursos se editan explícitamente; no se crean servidores ni NAT por cada diez clientes. Cinco empresas es la referencia presupuestaria de arquitectura, no un límite técnico ni una regla de autoescalado. Validar concurrencia, tiempos, capacidad y reintentos en un piloto. ECR usa Operacional!B38 como tamaño de imagen común; C38 y D38 quedan identificados como referencias originales sin efecto. Los auxiliares cloud (respaldos, alertas y otros cargos no estimados) se pueden presupuestar aparte; empiezan en 0 por falta de una tarifa documentada.

Los costos comunes continúan desde el mes de inicio de plataforma, incluso sin clientes. El personal puede cobrarse por horas utilizadas o por bloques de capacidad: los bloques reemplazan el cargo por horas recurrentes para evitar duplicaciones. Las altas se contratan aparte por hora. El costo real del trabajo se puede ingresar separado de la tarifa comercial; si queda vacío, se utiliza la tarifa del Excel como referencia. En personal por bloques, se pueden definir horas útiles, costo mensual completo y número mínimo de bloques contratados.

La venta comienza en modo fijo. Las tarifas iniciales son los mínimos originales del Excel, no precios comerciales recomendados. Las excepciones por cliente prevalecen sobre la tarifa por tamaño. Los precios fijos no cambian ante sobrecostos, variaciones de cartera o el término de la cuota de inversión. La cotización automática queda disponible, con una acción para fijar los precios calculados.

En la comparación se pueden aplicar los precios fijos actuales a todas las alternativas o respetar los precios de cada escenario guardado. La comparación no modifica las versiones guardadas. Los escenarios v1/v2 se convierten a cloud compartido al cargarse, mostrando un aviso: conservan cartera, tarifas y supuestos de trabajo, pero sus resultados cloud cambian. La exportación usa `panel-b2b-v3`; la importación admite las tres versiones.

El detalle por categorías concilia con los costos comunes/por cliente/por capacidad. En personal por bloques, soporte y mantenimiento distribuyen el costo contratado según demanda de horas, incluida capacidad ociosa; no agregan otro cargo por hora. Si no hay demanda, los bloques mínimos se muestran en otros costos. Las altas del mes y la inversión inicial aparecen separadas de la operación. La proyección descuenta la inversión una sola vez; no vuelve a descontar su cuota. Las licencias de autores de INFORM deben presupuestarse en otros costos comunes; los perfiles de 3/10/20 usuarios solo cubren lectores.

En escritorio, la barra lateral tiene desplazamiento independiente, ajusta su altura al espacio visible y no arrastra la página al llegar a sus límites. En pantallas pequeñas vuelve al desplazamiento normal de página.

La sección **Lógica y origen** documenta los cálculos, supuestos y limitaciones. Los cambios se guardan en el navegador cuando está disponible el almacenamiento local. El modelo no modifica el Excel original ni envía los escenarios a un servidor.

## Validación

Ejecuta con Node.js, sin instalar dependencias:

```sh
node tests/model.test.cjs
```

257 comprobaciones cubren recursos compartidos sin multiplicación por cliente, almacenamiento agregado, consumos, ausencia de saltos artificiales, conciliación de ambas clasificaciones, escenarios y meses, costos con cero clientes, precios fijos, personal por capacidad, inversión y migración v1/v2. Los totales antiguos del Excel se conservan como referencia histórica, no como resultado esperado del modelo corregido. Se verificaron en navegador la navegación, edición de soporte, cambio de mes, selección del RDS compartido, personal por bloques y los 141 campos de origen sin duplicaciones. No requiere dependencias.
