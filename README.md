# Escenarios Panel BI

[Abrir aplicación](https://escenarios-panel-bi.vercel.app/) · Simulador de costos y venta B2B en USD, sin impuestos.

HTML autónomo, también utilizable sin conexión. Guarda datos en el navegador y permite exportar/importar JSON, descargar un HTML personalizado y generar PDF con jsPDF 4.2.1 incluido (licencia MIT en `LICENSE-jsPDF.txt`).

## Modelo v8

**Tamaños y empresas** es el único lugar para editar perfiles. Los precios se calculan a partir de los costos. Pequeño, mediano y grande tienen cantidades de empresas, empleados, Employee Group Containers, employee groups, usuarios, plan BI, mensualidad y precio one-time. Cada empresa específica copia un tamaño y posee un perfil independiente: una casilla determina si cuenta como 0 o 1. Todas comienzan en el mes 1.

Soporte, mantenimiento e implementación se definen en **días hombre**. La única variable en Tarifa y calendario es la tarifa diaria; la jornada es de 8 horas. Las demás referencias de calendario permanecen fijas. El ejemplo inicial usa US$600/día:

| Trabajo | Pequeño | Mediano | Grande |
|---|---:|---:|---:|
| Setup cloud, días | 0,5 | 1 | 1,5 |
| Configuración BI, días | 1,5 | 2 | 3 |
| Costo de implementación USD | 1.200 | 1.800 | 2.700 |
| Soporte, días/mes | 0,3 | 0,3 | 0,5 |


Estos valores iniciales aplican a configuraciones nuevas; las configuraciones guardadas conservan sus días.

El mantenimiento se configura como un costo compartido de la plataforma, inicialmente 0,25 días/mes. Se multiplica por la tarifa diaria y se distribuye por igual entre las empresas activas. Los días de soporte se configuran por perfil. La implementación se cobra al costo real. La suscripción de la cartera es soporte más mantenimiento compartido asignado. En la simulación se añade el costo cloud asignado a la empresa y un recargo cloud editable que comienza en 0 %. Las licencias se mantienen en el costo operativo para calcular el resultado.

### Escenarios

- **Base:** valores configurados.
- **Optimista:** costos × 0,8.
- **Conservador:** costos × 1,2.

El ajuste afecta costos cloud, otros operacionales comunes, soporte, mantenimiento compartido e implementación. Es una contingencia presupuestaria: no modifica tarifas, capacidad, licencias, inversión ni consumos técnicos. Los precios calculados cambian con los costos de soporte, mantenimiento e implementación. Los días equivalentes mostrados reflejan el factor del escenario; cada configuración guardada conserva sus propios parámetros.

### Simulación de una empresa

Un selector carga los tamaños estándar o una empresa específica existente. Parámetros, precio base, mes y escenario son de solo lectura. Solo se editan el margen cloud, los usuarios adicionales, su precio mensual y trabajos extra con nombre y horas.

`Trabajo extra = horas / 8 × tarifa día hombre`

Este valor se suma al costo y al precio de implementación por única vez, sin margen adicional ni un segundo factor de escenario. Los usuarios adicionales suman el precio ingresado y el costo de las licencias faltantes compatibles. Si se carga una empresa activa, la simulación la reemplaza temporalmente para no duplicarla; si está inactiva o es un tamaño estándar, agrega una empresa hipotética. No modifica la cartera.

La cartera activa de la simulación muestra los perfiles y cantidades utilizados para repartir los costos compartidos, identifica la empresa simulada y aclara si reemplaza una empresa activa o se suma al cálculo.

Las tarjetas **Implementación** y **Suscripción** actualizan los precios en vivo. El precio base de implementación se distribuye entre sus tareas proporcionalmente a los días, con conciliación a centavos. El detalle interno se mantiene en un desplegable. El PDF tiene dos modos: solo precio, o precio y costos internos.

### Cloud y empleados

La infraestructura siempre es compartida. RDS, gateway, NAT e imagen ETL se cobran por los recursos configurados, sin crear servidores por empresa. El disco presupuestado es el máximo entre el mínimo configurado y los datos agregados. Los consumos propios se asignan a cada empresa; los cargos comunes y el disco mínimo no utilizado se reparten entre empresas activas.

RDS estima 2 GB iniciales por empresa y 0,1 / 0,5 / 1 GB por mes según tamaño desde el segundo mes. El espacio adicional por EGC parte en 0 GB y requiere medición. La capacidad de servidores se ajusta manualmente.

Referencia de archivo: **15.000 empleados ≈ 0,6 GB**. Esta referencia no equivale al volumen histórico ni al tráfico de red. EGC y tiendas ajustan la estructura de procesamiento; no multiplican empleados ni usuarios con licencia. Se mantienen las referencias técnicas y parámetros avanzados previamente configurados, ahora fijos en la interfaz.

Los porcentajes de tráfico API y BI que pasan por NAT o generan salida a internet se configuran por separado; sus valores iniciales conservan la estimación previa y deben validarse con rutas medidas. Las tarifas se agrupan por servicio y deben revisarse según región, plataforma y contrato.

EventBridge Scheduler se considera dentro de la franquicia gratuita y no agrega costo. La frecuencia de ejecución continúa determinando las tareas ETL.

Fargate: ciclos mensuales = 24 / frecuencia × días; intentos = ciclos × (1 + reintentos%). Cada intento suma procesamiento y arranque, redondea al segundo superior y factura al menos 60 segundos. Costo = horas facturables × (vCPU × tarifa vCPU-h + RAM × tarifa GB-h). ETL y BI tienen frecuencias independientes. Las horas técnicas de cloud permanecen porque son unidades de facturación, no trabajo humano.

### Licencias e inversión

Pro/PPU se selecciona por perfil. Las licencias aportadas Pro cubren Pro; PPU cubre ambos planes. Las licencias internas de INFORM están incluidas en su paquete Microsoft y no se presupuestan aparte. Solo se calculan las licencias de lectores que INFORM compre para sus clientes. Si el cliente compra todas sus licencias, INFORM no incurre en costo de lectores.

La inversión se desembolsa una sola vez al inicio. La meta mensual se calcula para el proyecto, con inversión/plazo o anualidad si hay tasa, y termina al completar el plazo. Su reparto por empresa es informativo. El flujo acumulado no vuelve a descontar esta meta. Inversión pendiente = máximo(0, −resultado acumulado): disminuye con excedentes y puede aumentar con pérdidas.

## Vistas y guardado

- Vista general: indicadores, escala y evolución del proyecto.
- Detalles de costos: desglose de implementación, soporte, mantenimiento, operación, inversión y licencias, en solo lectura.
- Tamaños y empresas: edición centralizada de perfiles.
- Supuestos generales: tarifa diaria, costos comunes, inversión, licencias e infraestructura.
- Comparar escenarios: Base, Optimista y Conservador y configuraciones guardadas.
- Simular una empresa: acceso independiente, cotización en vivo y exportación PDF.

Los cambios válidos recalculan las vistas y muestran confirmación. La barra lateral mantiene desplazamiento independiente en escritorio.

La migración v1–v7 conserva precios, cantidades y parámetros principales. Convierte trabajo a días equivalentes; en contratos por capacidad usa el costo del mes seleccionado. Unifica incorporación en el mes 1. Archiva los datos anteriores en `legacyV7`, incluyendo actividades y simulación, para no perder la referencia original. Los precios se normalizan a centavos.

## Validación

```sh
node tests/model.test.cjs
```

Cubre días y tarifa, ±20%, precios calculados y margen cloud en simulación, conciliación por categoría/empresa, cloud y empleados, licencias, inversión, migración, perfiles específicos activables, simulación sin duplicación y reportes. Para generar un PDF de prueba:

```sh
node tests/model.test.cjs ejemplo.pdf price
node tests/model.test.cjs interno.pdf full
```

Publicación: cambios en `main` despliegan el proyecto `inform-cl/escenarios-panel-bi` en Vercel.
