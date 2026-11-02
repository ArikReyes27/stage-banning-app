# Recursos de personajes

Hay 86 parejas base PNG: icons/<id>/00.png y renders/<id>/00.png. Los IDs coinciden con src/data/characters.ts y permanecen estables para los torneos guardados.

El manifiesto src/data/characterAssets.ts distingue las variantes disponibles en origen de la única variante importada por personaje (00). Las rutas sourceIcon/sourceRender son relativas a res/fighters, no URLs públicas. Los PNG fueron recomprimidos sin pérdida; dimensiones y transparencia se conservan. La trazabilidad está en docs/phase7-assets-inventory.json.

Los iconos se muestran mediante CharacterIcon en registro y bracket; ante una imagen ausente se mantiene el fallback SVG. Los renders son retratos recortados o de encuadre no verificado, NO ilustraciones de cuerpo completo: fullBodyRender permanece null y no se utilizan en VS.

No copiar variantes adicionales, sobrescribir recursos o cambiar IDs sin revisar el alcance. Los originales permanecen intactos en la carpeta fuente. Ver src/PROMPT_FASE_7_ASSETS.md para el inventario, restricciones e instrucciones de comprobación.
