# Escenarios Panel BI

Simulador de costos y ventas de un panel B2B. [Abrir aplicación](https://escenarios-panel-bi.vercel.app/).

HTML autónomo, sin dependencias ni instalación. También puedes descargar `index.html` y abrirlo sin conexión. Los escenarios se guardan en el navegador; se pueden exportar/importar como JSON o descargar dentro de un HTML. La exportación PDF usa jsPDF 4.2.1 incluido en el HTML, sin conexión; licencia MIT en `LICENSE-jsPDF.txt`.

## Vistas

- **Vista general**, en azul: cartera, indicadores, escala, evolución y sensibilidad.
- **Detalles de costos**, en turquesa: one-time, soporte, operacional, mantenimiento, inversión y licencias, con entradas editables y conciliación.
- **Supuestos y variables**: calendario, escenarios, tarifas, mediciones de referencia e infraestructura compartida.
- **Tamaños y precios**: parámetros y precios fijos únicos para pequeño, mediano y grande.
- **Empresas**: nombre, tamaño, cantidad y mes de incorporación. Sus parámetros y precios se heredan del tamaño, sin excepciones individuales.
- **Clasificación y capacidad**: trabajo común, por cliente y por bloques de personal.
- **Comparar escenarios**: los mismos precios fijos o los propios de cada alternativa.
- **Simular una empresa**: EGC, tiendas, usuarios, plan, frecuencias ETL/BI, CPU/RAM, volumen, soporte, precios y margen. Permite cargar una empresa, reemplazarla solo para el cálculo, agregar una empresa hipotética a la cartera o evaluar la plataforma con una sola empresa.
- **Cómo se calcula**: fórmulas, alcance y supuestos.

Cada modificación válida recalcula las vistas y muestra una confirmación. La notificación distingue cambios de resultados de cambios guardados que no alteran los importes. Los valores inválidos se rechazan. En escritorio, la barra lateral se desplaza de forma independiente.

## Modelo v6

Importes en USD, sin impuestos. La cartera inicial contiene 10 empresas individuales: 5 pequeñas, 3 medianas y 2 grandes. Todas las empresas de un mismo tamaño comparten mensualidad, alta, EGC, tiendas, usuarios y demás parámetros de ese tamaño. Cantidad mayor que uno representa empresas idénticas para escenarios masivos (hasta 500 filas). Tarifas, horas y precios de venta son supuestos editables; no representan una cotización comercial validada.

### Recuperación de inversión del proyecto

La inversión se desembolsa una sola vez al inicio de la plataforma. Su objetivo de recuperación mensual es inversión/plazo, o una anualidad con tasa mensual si se define interés. El plazo corre desde el inicio del proyecto y no se reinicia al incorporar clientes. El objetivo existe incluso sin clientes; solo su reparto informativo usa los clientes activos del mes. Indicadores, gráficos y comparación utilizan la misma fórmula.

El resultado operativo excluye la recuperación; el resultado tras recuperación resta ese objetivo. El flujo acumulado descuenta la inversión inicial una sola vez y no vuelve a descontar las cuotas objetivo. Los ingresos de altas y sus costos se incluyen en el mes de incorporación.

La tarjeta principal **Inversión pendiente de recuperar** muestra máximo(0, −resultado acumulado) al cierre del mes seleccionado. Disminuye con excedentes, puede superar la inversión inicial si se acumulan pérdidas y llega a cero cuando se cubre el saldo. Antes del desembolso indica que la inversión aún no se ha realizado. El saldo no se reduce artificialmente por la cuota objetivo de recuperación.

### Power BI Pro o PPU

Se elige Pro o PPU por tamaño; las tarifas de costo son comunes y editables. Referencias iniciales: Pro 14 USD y Premium por usuario 24 USD al mes por usuario, con pago anual, según [Microsoft](https://www.microsoft.com/en-us/microsoft-fabric/features/power-bi/pricing). El escenario nuevo usa PPU; los escenarios antiguos conservan su tarifa e identifican su plan anterior como Pro.

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

Employee Group Containers (EGC) es la cantidad de bases de una empresa. Employee groups es su total de tiendas, no tiendas por EGC. Las cantidades se configuran por tamaño y se aplican a todas sus empresas. La simulación permite modificarlas temporalmente, sin cambiar la plantilla ni la cartera. Las referencias de medición cloud se conservan separadas para calibrar los consumos.

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

Los precios fijos por tamaño no cambian ante sobrecostos, cambios de cartera o término de la recuperación. Son la única fuente de precios de la cartera. La cotización automática está disponible solo en la simulación de una empresa.

La importación admite versiones v1–v6 y la exportación utiliza `panel-b2b-v6`. La migración conserva la cartera y las tarifas por tamaño, crea sus parámetros a partir de las referencias anteriores y archiva las antiguas excepciones por empresa en `legacyCompanyOverrides` y la simulación anterior en `legacySimulationV5`. Esos respaldos se exportan en JSON pero no intervienen en cálculos. Se muestra un aviso para revisar Tamaños y precios. Las alternativas guardadas no se modifican al compararlas.

## Simulación y cobros extra

Seleccionar pequeño, mediano o grande precarga todos los parámetros, mensualidad, alta y precio por usuario adicional. **Recargar tamaño** restaura la referencia vigente. Ambas acciones reinician los ajustes temporales y los extras; editar una plantilla no sobrescribe una simulación que ya se está preparando.

La simulación permite editar el precio mensual base y de alta, y añadir:

- Usuarios adicionales: cantidad × precio por usuario/mes. Se agregan a los usuarios incluidos y generan el costo de las licencias que INFORM deba comprar, considerando las licencias compatibles aportadas. El precio extra empieza con la tarifa de licencia como referencia comercial editable, sin margen implícito.
- Servicio mensual adicional: nombre, cantidad, precio unitario y costo interno unitario; por ejemplo soporte ampliado.
- Adicional de alta: nombre, cantidad, precio unitario y costo interno unitario; por ejemplo implementación especial.

Mensualidad = base + usuarios extra + servicio mensual. Alta = base + adicionales de alta. Los costos internos de servicios parten en cero hasta presupuestarlos. Los cobros se redondean a centavos por línea. En cotización automática, el precio base excluye el costo incremental de usuarios extra; los extras se cobran separadamente para evitar duplicaciones.

Ambos PDF detallan base y extras, con totales conciliados. El PDF comercial excluye costos y margen; el interno agrega costos de licencias, servicios y adicionales de alta. La simulación no modifica ni guarda excepciones en la cartera.

## Validación

Ejecuta con Node.js, sin instalar dependencias:

```sh
node tests/model.test.cjs
```

Las comprobaciones cubren recuperación a nivel del proyecto, saldo pendiente, clientes futuros, ausencia de clientes, inversión sin doble descuento, planes y licencias aportadas, mínimos y redondeo Fargate, frecuencias, reintentos, costos compartidos, bloques de personal, conciliación de categorías, ventas fijas y migración.

También incluyen herencia por tamaño, exclusión de antiguos precios individuales, EGC/tiendas con impacto exclusivo en cloud, precarga de los tres tamaños, aislamiento de la simulación, extras sin duplicación, reemplazo de empresa y desglose comercial a centavos. Se comprueban en navegador la edición, precarga, notificaciones y exportación PDF; los PDF se renderizan y revisan visualmente. Estas verificaciones validan la lógica implementada; tiempos y consumos presupuestados requieren validación operacional.
