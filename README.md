# EIF400 II 2024 BIESVM P1 3:00 PM - Joel Ramirez Vargas

## Proceso de Build Automatizado Completo

Para preparar y construir el proyecto, sigue estos pasos:

1. Clona el repositorio y navega a la raíz del proyecto.
2. Antes de ejecutar cualquier comando dirigirse al package.json y modificar la siguiente linea:
- **WARNING:** Asegúrate de cambiar la ruta completa en el siguiente comando a la ubicación donde se encuentra el archivo `antlr-4.13.1-complete.jar` en tu sistema:
  
   ```bash
   "build": "npm install && npm run prepare && java -jar 'C:/Users/sebas/Desktop/EIF400-II-2024-BIES-VM-3-PM/lib/antlr-4.13.1-complete.jar' -Dlanguage=JavaScript BIESVM.g4 -visitor && node index.js"
   
4. Ejecuta el siguiente comando para llevar a cabo el proceso de build automatizado:

   ```bash
   npm run build

