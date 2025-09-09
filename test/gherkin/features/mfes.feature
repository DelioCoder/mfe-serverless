Feature: Solicitud de MFe

  Scenario: Crear una solicitud de MFE
    Given un usuario autenticado
    When envía un POST a "/mfes/requests" con datos válidos
    Then la API responde con código 201
    And la respuesta contiene el campo message es igual a "Solicitud creada"

