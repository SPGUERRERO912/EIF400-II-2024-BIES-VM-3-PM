<h6><small>UNA. Escuela de Informática.
EIF400-II-2024. 
Paradigmas de Programación.
Proyecto BiesVM Anexo II Sobre Branches
17/09/2024</small></h6>
# EIF400 II 2024 BIESVM P1 3:00 PM - Joel Ramirez Vargas
### Integrantes 50994
- Joel Ramírez Vargas 119020788 [Coordinador]
- Marco Leandro Chacón 118510803
- Sebastián Peñaranda Guerrero 118440262
- Valentina Hernández Quesada 118710693    
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

