# Escenarios Panel BI

Simulador interactivo de costos y ventas de un panel B2B, basado en `Costos Panel Bi.xlsx`.

## Uso

Descarga `index.html` y ábrelo en un navegador. Funciona sin internet y no requiere instalación ni dependencias.

- Configura clientes o grupos por tamaño, cantidad y mes de incorporación.
- Ajusta 141 parámetros del Excel, consumos, soporte, licencias, precios y margen.
- Revisa costos totales y por cliente, evolución mensual, recuperación de inversión y sensibilidad.
- Guarda y compara escenarios. Exporta/importa respaldos JSON o descarga un HTML con tus cambios.

## Base del modelo

Los valores se expresan en USD, sin impuestos. Las tarifas son las del archivo de origen, sin actualización externa. La cartera inicial es un ejemplo: 5 clientes pequeños, 3 medianos y 2 grandes. La infraestructura dedicada reproduce el Excel; compartir gateway y NAT es un supuesto opcional editable.

La sección **Lógica y origen** documenta los cálculos, supuestos y limitaciones. Los cambios se guardan en el navegador cuando está disponible el almacenamiento local. El modelo no modifica el Excel original ni envía los escenarios a un servidor.

La validación incluyó los tres tamaños de cliente y sus 36 meses de proyección, además de altas diferidas, cero clientes, márgenes, licencias, capacidades compartidas y recuperación de inversión.
