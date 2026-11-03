# language: es
Característica: Acceso y consulta de información operativa
  Antecedentes:
    Dado que existe una entidad con sede y dispositivo de prueba en la API real

  Escenario: Una cuenta de prueba activa accede a su panel
    Cuando inicia sesión con credenciales válidas
    Entonces se muestra el panel autenticado

  Escenario: La aplicación rechaza credenciales inválidas
    Cuando inicia sesión con una contraseña incorrecta
    Entonces muestra un error y conserva la pantalla de acceso

  Escenario: El usuario consulta establecimientos desde el frontend integrado
    Cuando inicia sesión con credenciales válidas
    Y navega al listado de establecimientos
    Entonces la sede persistida se muestra en pantalla

  Escenario: El usuario consulta dispositivos desde el frontend integrado
    Cuando inicia sesión con credenciales válidas
    Y navega al listado de dispositivos
    Entonces el dispositivo persistido se muestra en pantalla
