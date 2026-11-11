# Escenarios Panel BI

[Abrir aplicación](https://escenarios-panel-bi.vercel.app/) · Simulador de costos y venta B2B en USD, sin impuestos.

HTML autónomo, también utilizable sin conexión. Guarda datos en el navegador y permite exportar/importar JSON, descargar un HTML personalizado y generar PDF con jsPDF 4.2.1 incluido (licencia MIT en `LICENSE-jsPDF.txt`).

## Modelo v8

**Tamaños y empresas** es el único lugar para editar perfiles y precios. Pequeño, mediano y grande tienen cantidades de empresas, empleados, Employee Group Containers, employee groups, usuarios, plan BI, mensualidad y precio one-time. Cada empresa específica copia un tamaño y posee un perfil independiente: una casilla determina si cuenta como 0 o 1. Todas comienzan en el mes 1.

Soporte, mantenimiento e implementación se definen en **días hombre**. La única variable en Tarifa y calendario es la tarifa diaria; la jornada es de 8 horas. Las demás referencias de calendario permanecen fijas. El ejemplo inicial usa US$600/día:

| Trabajo | Pequeño | Mediano | Grande |
|---|---:|---:|---:|
| Setup cloud, días | 1 | 1 | 2 |
| Configuración BI, días | 3 | 3 | 3 |
| Costo de implementación USD | 2.400 | 2.400 | 3.000 |
| Soporte, días/mes | 0,3 | 0,3 | 0,5 |
| Mantenimiento por empresa, días/mes | 0 | 0 | 0 |

El mantenimiento común de plataforma se presupuesta una vez, inicialmente 0,25 días/mes. Los días y precios son estimaciones editables, no una cotización contractual. Los precios comerciales son fijos y no se recalculan al aumentar costos.

### Escenarios

- **Base:** valores configurados.
- **Optimista:** costos × 0,8.
- **Conservador:** costos × 1,2.

El ajuste afecta costos cloud, otros operacionales comunes, soporte, mantenimiento e implementación. No modifica licencias, inversión, precios ni consumos técnicos. Los días equivalentes mostrados reflejan el factor del escenario. Las configuraciones guardadas permiten comparar precios propios o aplicar los precios actuales a perfiles coincidentes; empresas específicas se identifican mediante un ID estable.

### Simulación de una empresa

Tres tarjetas cargan los tamaños estándar; un selector carga empresas específicas existentes. Parámetros, precio base, mes y escenario son de solo lectura. Solo se editan usuarios adicionales, su precio mensual y trabajos extra con nombre y horas.

`Trabajo extra = horas / 8 × tarifa día hombre`

Este valor se suma al costo y al precio de implementación por única vez, sin margen adicional ni un segundo factor de escenario. Los usuarios adicionales suman el precio ingresado y el costo de las licencias faltantes compatibles. Si se carga una empresa activa, la simulación la reemplaza temporalmente para no duplicarla; si está inactiva o es un tamaño estándar, agrega una empresa hipotética. No modifica la cartera.

Las tarjetas **Implementación** y **Suscripción** actualizan los precios en vivo. El precio base de implementación se distribuye entre sus tareas proporcionalmente a los días, con conciliación a centavos. El detalle interno se mantiene en un desplegable. El PDF tiene dos modos: solo precio, o precio y costos internos.

### Cloud y empleados

La infraestructura siempre es compartida. RDS, gateway, NAT e imagen ETL se cobran por los recursos configurados, sin crear servidores por empresa. El disco presupuestado es el máximo entre el mínimo configurado y los datos agregados. Los consumos propios se asignan a cada empresa; los cargos comunes y el disco mínimo no utilizado se reparten entre empresas activas.

Referencia de archivo: **15.000 empleados ≈ 0,6 GB**. EGC y tiendas ajustan la estructura de procesamiento; no multiplican empleados ni usuarios con licencia. Se mantienen las referencias técnicas y parámetros avanzados previamente configurados, ahora fijos en la interfaz.

Fargate: ciclos mensuales = 24 / frecuencia × días; intentos = ciclos × (1 + reintentos%). Cada intento suma procesamiento y arranque, redondea al segundo superior y factura al menos 60 segundos. Costo = horas facturables × (vCPU × tarifa vCPU-h + RAM × tarifa GB-h). ETL y BI tienen frecuencias independientes. Las horas técnicas de cloud permanecen porque son unidades de facturación, no trabajo humano.

### Licencias e inversión

Pro/PPU se selecciona por perfil. Las licencias aportadas Pro cubren Pro; PPU cubre ambos planes. Autores INFORM se presupuestan una vez para la plataforma. Si el cliente compra todas sus licencias, INFORM no incurre en costo de lectores.

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

Cubre días y tarifa, ±20%, precios fijos, conciliación por categoría/empresa, cloud y empleados, licencias, inversión, migración, perfiles específicos activables, simulación sin duplicación y reportes. Para generar un PDF de prueba:

```sh
node tests/model.test.cjs ejemplo.pdf price
node tests/model.test.cjs interno.pdf full
```

Publicación: cambios en `main` despliegan el proyecto `inform-cl/escenarios-panel-bi` en Vercel.
