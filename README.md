# Escenarios Panel BI

Simulador de costos y ventas de un panel B2B. [Abrir aplicación](https://escenarios-panel-bi.vercel.app/).

HTML autónomo, sin dependencias ni instalación. También puedes descargar `index.html` y abrirlo sin conexión. Los escenarios se guardan en el navegador; se pueden exportar/importar como JSON o descargar dentro de un HTML.

## Vistas

- **Vista general**, en azul: cartera, indicadores, escala, evolución y sensibilidad.
- **Detalles de costos**, en turquesa: one-time, soporte, operacional, mantenimiento, inversión y licencias, con entradas editables y conciliación.
- **Supuestos y variables**: perfiles, calendario, escenarios, infraestructura compartida y programación ETL/Power BI.
- **Clientes y ventas**: cantidades, tamaños, mes de incorporación, licencias aportadas, precios fijos y excepciones.
- **Clasificación y capacidad**: trabajo común, por cliente y por bloques de personal.
- **Comparar escenarios**: los mismos precios fijos o los propios de cada alternativa.
- **Cómo se calcula**: fórmulas, alcance y supuestos.

Cada modificación válida recalcula las vistas y muestra una confirmación. La notificación distingue cambios de resultados de cambios guardados que no alteran los importes. Los valores inválidos se rechazan. En escritorio, la barra lateral se desplaza de forma independiente.

## Modelo v4

Importes en USD, sin impuestos. La cartera inicial de ejemplo incluye 5 clientes pequeños, 3 medianos y 2 grandes. Tarifas, horas y precios de venta son supuestos editables; no representan una cotización comercial validada.

### Recuperación de inversión del proyecto

La inversión se desembolsa una sola vez al inicio de la plataforma. Su objetivo de recuperación mensual es inversión/plazo, o una anualidad con tasa mensual si se define interés. El plazo corre desde el inicio del proyecto y no se reinicia al incorporar clientes. El objetivo existe incluso sin clientes; solo su reparto informativo usa los clientes activos del mes. Indicadores, gráficos y comparación utilizan la misma fórmula.

El resultado operativo excluye la recuperación; el resultado tras recuperación resta ese objetivo. El flujo acumulado descuenta la inversión inicial una sola vez y no vuelve a descontar las cuotas objetivo. Los ingresos de altas y sus costos se incluyen en el mes de incorporación.

### Power BI Pro o PPU

Se puede elegir el plan global y editar sus tarifas. Referencias iniciales: Pro 14 USD y Premium por usuario 24 USD al mes por usuario, con pago anual, según [Microsoft](https://www.microsoft.com/en-us/microsoft-fabric/features/power-bi/pricing). El escenario nuevo usa PPU; los escenarios antiguos conservan su tarifa e identifican su plan anterior como Pro.

Las licencias aportadas Pro no descuentan necesidades PPU. Las PPU aportadas son compatibles con ambos planes. Los autores de INFORM se presupuestan como costo común; comienzan en cero hasta ingresar la cantidad real. Si el cliente aporta las licencias, los lectores no generan costo para INFORM, pero deben disponer del plan compatible. La aplicación avisa si la frecuencia programada supera 8 refrescos diarios en Pro o 48 en PPU.

### Cloud compartido y ETL

La arquitectura de referencia usa RDS PostgreSQL db.t4g.large Single-AZ, gateway EC2 Windows t3.large, NAT con IPv4 e imagen ETL compartidos. El disco mínimo RDS se aplica a la plataforma y crece con los datos agregados. Las cantidades de servidores se configuran explícitamente; no se crean recursos individuales ni saltos automáticos por número de clientes. Cinco empresas es una referencia presupuestaria, no un límite técnico.

Fargate suma tareas generadas por los clientes dentro de la infraestructura compartida:

- Ciclos mensuales = 24 / intervalo ETL en horas × días del mes.
- Intentos = ciclos × (1 + porcentaje de intentos adicionales / 100).
- Segundos facturables por intento = máximo(60, redondeo superior de procesamiento + arranque/descarga).
- Costo = intentos × segundos facturables / 3600 × (vCPU × tarifa/h + GB RAM × tarifa/h).

El mínimo de un minuto y redondeo por segundo corresponden a [Fargate Linux/x86](https://aws.amazon.com/fargate/pricing/). Los 60 segundos iniciales de arranque son un ejemplo editable, no una medición. Los reintentos comienzan en 0% y suponen repetir la tarea completa. Ajustar ambos con mediciones del piloto.

Los volúmenes de referencia de API, Power BI y logs corresponden a 240 ciclos al mes (cada 3 horas, 30 días). API y logs escalan con intentos ETL; la salida Power BI tiene una frecuencia independiente. NAT suma API entrante y salida Power BI; internet saliente considera esta última. No se incluye explícitamente una carga histórica inicial: presupuestarla aparte si es material. Las tarifas AWS son supuestos editables. Respaldos, alertas y otros cargos no estimados pueden ingresarse como auxiliares cloud; inicialmente están en cero.

El cloud se cobra una sola vez y se reparte por igual únicamente para mostrar costos medios por cliente. El costo real depende del dimensionamiento y uso de toda la cartera.

### Trabajo, capacidad y ventas

Las actividades de mantenimiento pueden ser comunes o individuales. El personal puede costearse por horas o por bloques de capacidad; los bloques reemplazan el cargo por horas recurrentes. Las altas se contratan aparte. Soporte y mantenimiento distribuyen el costo de los bloques según su demanda; los bloques mínimos sin demanda quedan en otros costos.

Los precios fijos no cambian ante sobrecostos, cambios de cartera o término de la recuperación. Las excepciones de cada grupo prevalecen sobre la tarifa por tamaño. La cotización automática aplica el margen objetivo y permite fijar después los precios calculados.

La importación admite versiones v1–v4 y la exportación utiliza `panel-b2b-v4`. Las migraciones conservan cartera y supuestos comerciales; los cálculos se actualizan a las reglas actuales y se muestra un aviso. Las alternativas guardadas no se modifican al compararlas.

## Validación

Ejecuta con Node.js, sin instalar dependencias:

```sh
node tests/model.test.cjs
```

459 comprobaciones cubren inversión a nivel del proyecto, coincidencia entre gráfico e indicadores, clientes futuros, ausencia de clientes, inversión sin doble descuento, planes y licencias aportadas, autores comunes, mínimos y redondeo Fargate, frecuencias, reintentos, costos compartidos, bloques de personal, conciliación de categorías, ventas fijas y migración de escenarios.

También se verificaron en navegador el cambio Pro/PPU, edición de frecuencia ETL, actualización de tráfico/logs/Fargate, notificaciones y navegación. Estas pruebas validan la lógica implementada; el dimensionamiento, tiempos y consumos presupuestados requieren validación operacional.
