# Escenarios Panel BI

Simulador de costos y ventas de un panel B2B. [Abrir aplicación](https://escenarios-panel-bi.vercel.app/).

HTML autónomo, sin dependencias ni instalación. También puedes descargar `index.html` y abrirlo sin conexión. Los escenarios se guardan en el navegador; se pueden exportar/importar como JSON o descargar dentro de un HTML. La exportación PDF usa jsPDF 4.2.1 incluido en el HTML, sin conexión; licencia MIT en `LICENSE-jsPDF.txt`.

## Vistas

- **Vista general**, en azul: cartera, indicadores, escala, evolución y sensibilidad.
- **Detalles de costos**, en turquesa: one-time, soporte, operacional, mantenimiento, inversión y licencias, con entradas editables y conciliación.
- **Supuestos y variables**: perfiles, calendario, escenarios, infraestructura compartida y programación ETL/Power BI.
- **Empresas y ventas**: cantidades, tamaños, mes de incorporación, licencias aportadas, precios fijos y excepciones.
- **Clasificación y capacidad**: trabajo común, por cliente y por bloques de personal.
- **Comparar escenarios**: los mismos precios fijos o los propios de cada alternativa.
- **Simular una empresa**: EGC, tiendas, usuarios, plan, frecuencias ETL/BI, CPU/RAM, volumen, soporte, precios y margen. Permite cargar una empresa, reemplazarla solo para el cálculo, agregar una empresa hipotética a la cartera o evaluar la plataforma con una sola empresa.
- **Cómo se calcula**: fórmulas, alcance y supuestos.

Cada modificación válida recalcula las vistas y muestra una confirmación. La notificación distingue cambios de resultados de cambios guardados que no alteran los importes. Los valores inválidos se rechazan. En escritorio, la barra lateral se desplaza de forma independiente.

## Modelo v5

Importes en USD, sin impuestos. La cartera inicial contiene 10 empresas individuales: 5 pequeñas, 3 medianas y 2 grandes. Cada empresa tiene mensualidad, alta, EGC y tiendas propios. Cantidad mayor que uno representa empresas idénticas para escenarios masivos; el botón Separar empresas permite personalizarlas (hasta 500 filas). Tarifas, horas y precios de venta son supuestos editables; no representan una cotización comercial validada.

### Recuperación de inversión del proyecto

La inversión se desembolsa una sola vez al inicio de la plataforma. Su objetivo de recuperación mensual es inversión/plazo, o una anualidad con tasa mensual si se define interés. El plazo corre desde el inicio del proyecto y no se reinicia al incorporar clientes. El objetivo existe incluso sin clientes; solo su reparto informativo usa los clientes activos del mes. Indicadores, gráficos y comparación utilizan la misma fórmula.

El resultado operativo excluye la recuperación; el resultado tras recuperación resta ese objetivo. El flujo acumulado descuenta la inversión inicial una sola vez y no vuelve a descontar las cuotas objetivo. Los ingresos de altas y sus costos se incluyen en el mes de incorporación.

La tarjeta principal **Inversión pendiente de recuperar** muestra máximo(0, −resultado acumulado) al cierre del mes seleccionado. Disminuye con excedentes, puede superar la inversión inicial si se acumulan pérdidas y llega a cero cuando se cubre el saldo. Antes del desembolso indica que la inversión aún no se ha realizado. El saldo no se reduce artificialmente por la cuota objetivo de recuperación.

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

El cloud se cobra una sola vez. Fargate, tráfico, logs, secretos y almacenamiento utilizado se atribuyen a la empresa que genera el consumo. Los cargos comunes y la capacidad mínima de almacenamiento sobrante se reparten por igual entre empresas activas. Contingencia y variación cloud se aplican una vez y la suma atribuida concilia con el total de la plataforma.

### EGC y employee groups

Employee Group Containers (EGC) es la cantidad de bases de una empresa. Employee groups es su total de tiendas, no tiendas por EGC. Las cantidades por empresa vacías heredan referencias del perfil, y se pueden personalizar sin cambiar su perfil de trabajo.

- Proporción EGC = EGC reales / referencia EGC.
- Proporción de volumen = tiendas reales / referencia tiendas × factor de volumen por tienda.
- Tiempo de procesamiento = tiempo de referencia × (peso EGC × proporción EGC + peso volumen × proporción de volumen) × factor de escenario.
- Logs usa la misma combinación con un peso EGC independiente.
- API y salida Power BI usan la proporción de volumen y sus respectivas frecuencias.
- Disco = (datos iniciales + crecimiento × edad) × proporción de volumen + EGC × espacio adicional por base.

Los pesos de EGC y volumen suman 100%; el usuario edita el peso EGC y su complemento se calcula automáticamente. Inicialmente son 50/50, una estimación sin medir. El espacio adicional por base inicia en cero hasta medirlo. EGC y tiendas afectan exclusivamente al cloud; no modifican soporte, mantenimiento, alta comercial, inversión ni licencias. CPU/RAM y servidores se configuran explícitamente, sin escalado automático.

### PDF de una empresa

El selector **Contenido del PDF** permite descargar:

- **Solo desglose de precio**: mensualidad, alta, suma del mes con alta, distribución comercial del precio y parametrización relevante. Excluye costos, margen, recuperación interna y tarifas de infraestructura.
- **Precio y costos internos**: agrega el desglose operativo y cloud, meta de recuperación asignada, resultado mensual, supuestos y tarifas aplicadas.

La distribución comercial es proporcional al peso de los componentes del servicio; no son tarifas de venta independientes. El reparto a centavos concilia exactamente con la mensualidad, incluidos precios manuales y gratuitos. El simulador y el PDF usan la misma función de cálculo. La empresa simulada no modifica la cartera, y su configuración se guarda dentro del escenario.

### Trabajo, capacidad y ventas

Las actividades de mantenimiento pueden ser comunes o individuales. En la tabla de clasificación, el alcance Por cliente permite editar directamente las horas mensuales para pequeño, mediano y grande; los campos están sincronizados con Detalles de costos. En alcance Común se editan las horas únicas de la plataforma y se excluyen las horas individuales. El personal puede costearse por horas o por bloques de capacidad; los bloques reemplazan el cargo por horas recurrentes. Las altas se contratan aparte. Soporte y mantenimiento distribuyen el costo de los bloques según su demanda; los bloques mínimos sin demanda quedan en otros costos.

Los precios fijos no cambian ante sobrecostos, cambios de cartera o término de la recuperación. Las excepciones de cada grupo prevalecen sobre la tarifa por tamaño. La cotización automática aplica el margen objetivo y permite fijar después los precios calculados.

La importación admite versiones v1–v5 y la exportación utiliza `panel-b2b-v5`. Las migraciones conservan cartera y supuestos comerciales; los cálculos se actualizan a las reglas actuales y se muestra un aviso. Las alternativas guardadas no se modifican al compararlas.

## Validación

Ejecuta con Node.js, sin instalar dependencias:

```sh
node tests/model.test.cjs
node tests/company.test.cjs
```

910 comprobaciones cubren inversión a nivel del proyecto, saldo pendiente con excedentes y pérdidas, coincidencia entre gráfico e indicadores, clientes futuros, ausencia de clientes, inversión sin doble descuento, planes y licencias aportadas, autores comunes, mínimos y redondeo Fargate, frecuencias, reintentos, costos compartidos, bloques de personal, conciliación de categorías, ventas fijas y migración de escenarios.

Las nuevas pruebas incluyen EGC/tiendas independientes, impacto solo en cloud, pesos, conciliación por empresa, aislamiento de la simulación, reemplazo de empresa, precio manual y automático, y desglose comercial a centavos. También se verifican edición de mantenimiento, cantidades y pesos en navegador, y PDFs con y sin costos. Los PDF se renderizan y se revisan visualmente. Estas pruebas validan la lógica implementada; el dimensionamiento, tiempos y consumos presupuestados requieren validación operacional.
