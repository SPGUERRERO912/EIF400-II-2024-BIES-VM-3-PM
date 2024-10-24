# EIF400 II 2024 BIESVM P1 3:00 PM - Joel Ramirez Vargas
### Integrantes del grupo 05 NRC 50994
- Joel Ramírez Vargas 119020788 [Coordinador]
- Marco Leandro Chacón 118510803
- Sebastián Peñaranda Guerrero 118440262
- Valentina Hernández Quesada 118710693
  
Se utilizó apoyo de ChatGPT para la construcción del proyecto en Node.js, específicamente para integrar herramientas como Jest, Lint y Prettier. Además, de para obtener soporte en tareas relacionadas con la consola.
## Proceso de Build Automatizado Completo

Para preparar y construir el proyecto, sigue estos pasos:

1. Clona el repositorio y navega a la raíz del proyecto.
2. Generación de archivos de ANTLR4:
  - **Nota Importante:** Asegúrate de cambiar la ruta completa en el siguiente comando a la ubicación donde se encuentra el archivo `antlr-4.13.1-complete.jar` en tu sistema:
  
     ```bash
    cd grammar
    java -jar "C:/Users/sebas/Desktop/EIF400-II-2024-BIES-VM-3-PM/lib/antlr-4.13.1-complete.jar" -Dlanguage=JavaScript BIESVM.g4 -visitor
    cd ../
   
3. Ejecuta el siguiente comando para llevar a cabo el proceso de build automatizado(realizando además la bateria de test cases agregados en el codigo):

   ```bash
   npm run build

4. Para la ejecución individual de un input(.basm) y realizar su depuración. Se pueden visualizar salida.log y errores.log al ejecutar el siguiente comando:
  - **Nota Importante:**
    - `--o outfile` : las salidas de `print` (sysout) en el archivo `outfile`
    - `--e errfile` : las salidas de errores (syserr) en el archivo `errfile`
    - `--trace level`: 
      - En `level == 0`  no hay trace (ese es el default).
      - En `level == 1`cada vez que va a ejecutar una instruccion indica (en syserr) el `$id` de la función siendo ejecutada y la instrucción actual.
   ```bash
   node index.js --o salida.log --e errores.log --trace 1 input/testcase1.basm

