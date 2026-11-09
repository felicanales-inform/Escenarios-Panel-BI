# Escenarios Panel BI

Simulador interactivo de costos y ventas de un panel B2B, basado en `Costos Panel Bi.xlsx`.

## Uso

Descarga `index.html` y ábrelo en un navegador. Funciona sin internet y no requiere instalación ni dependencias.

- Configura clientes o grupos por tamaño, cantidad y mes de incorporación.
- Ajusta 141 parámetros del Excel, consumos, soporte, licencias y reglas de costos y venta.
- Separa trabajo común de plataforma, costos por cliente y costos por capacidad.
- Compara escenarios con precios de venta fijos y observa cambios de margen, incluso pérdidas.
- Revisa costos totales y por cliente, evolución mensual, recuperación de inversión y sensibilidad.
- Guarda y compara escenarios. Exporta/importa respaldos JSON o descarga un HTML con tus cambios.

## Base del modelo

Los valores se expresan en USD, sin impuestos. Las tarifas son las del archivo de origen, sin actualización externa. La cartera inicial es un ejemplo: 5 clientes pequeños, 3 medianos y 2 grandes.

La clasificación inicial propone 2 horas comunes mensuales para cambios de API, parches y revisión de costos/respaldos, tomadas del perfil pequeño del Excel. Cada actividad se puede cambiar a trabajo individual por tamaño. Los gateways y NAT compartidos usan una capacidad inicial de ejemplo de 10 clientes por bloque; estos supuestos requieren validación operativa.

Los costos comunes continúan desde el mes de inicio de plataforma, incluso sin clientes. El personal puede cobrarse por horas utilizadas o por bloques de capacidad: los bloques reemplazan el cargo por horas recurrentes para evitar duplicaciones. Las altas se contratan aparte por hora. El costo real del trabajo se puede ingresar separado de la tarifa comercial; si queda vacío, se utiliza la tarifa del Excel como referencia. En personal por bloques, se pueden definir horas útiles, costo mensual completo y número mínimo de bloques contratados.

La venta comienza en modo fijo. Las tarifas iniciales son los mínimos originales del Excel, no precios comerciales recomendados. Las excepciones por cliente prevalecen sobre la tarifa por tamaño. Los precios fijos no cambian ante sobrecostos, variaciones de cartera o el término de la cuota de inversión. La cotización automática queda disponible, con una acción para fijar los precios calculados.

En la comparación se pueden aplicar los precios fijos actuales a todas las alternativas o respetar los precios de cada escenario guardado. La comparación no modifica las versiones guardadas. Los escenarios JSON de la primera versión se migran conservando sus supuestos; la clasificación propuesta se aplica mediante una acción explícita.

En escritorio, la barra lateral tiene desplazamiento independiente, ajusta su altura al espacio visible y no arrastra la página al llegar a sus límites. En pantallas pequeñas vuelve al desplazamiento normal de página.

La sección **Lógica y origen** documenta los cálculos, supuestos y limitaciones. Los cambios se guardan en el navegador cuando está disponible el almacenamiento local. El modelo no modifica el Excel original ni envía los escenarios a un servidor.

## Validación

Ejecuta con Node.js, sin instalar dependencias:

```sh
node tests/model.test.cjs
```

205 comprobaciones cubren la reproducción del Excel en modo original, sus tres tamaños y 36 meses de proyección, separación de costos sin duplicaciones, umbrales de capacidad, costos con cero clientes, precios fijos, escenarios, migración y exportación/importación del estado. También se verificó en navegador el recálculo de los controles y la independencia del desplazamiento lateral.
