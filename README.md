# EIF400 II 2024 BIESVM P1 3:00 PM - Joel Ramirez Vargas

## Proceso de Build Automatizado Completo

Para preparar y construir el proyecto, sigue estos pasos:

1. Clona el repositorio y navega a la raíz del proyecto.
2. Generación de archivos de ANTLR4:
- **WARNING:** Asegúrate de cambiar la ruta completa en el siguiente comando a la ubicación donde se encuentra el archivo `antlr-4.13.1-complete.jar` en tu sistema:
  
   ```bash
  cd grammar
  java -jar "C:/Users/sebas/Desktop/EIF400-II-2024-BIES-VM-3-PM/lib/antlr-4.13.1-complete.jar" -Dlanguage=JavaScript BIESVM.g4 -visitor
  cd ../
   
3. Ejecuta el siguiente comando para llevar a cabo el proceso de build automatizado:

   ```bash
   npm run build

