Feature: Gestión de MFEs

  Scenario: Crear una solicitud de MFE
    Given un usuario autenticado
    When envía un POST a "/mfes/requests" con datos válidos
    Then la API responde con código 201
    And la respuesta contiene el campo "estado" igual a "pendiente"

  Scenario: Aprobar una solicitud de MFE
    Given un administrador autenticado
    When envía un PUT a "/admin/mfes-request/{id}/approve" con un mensaje
    Then la API responde con código 200
    And el campo "estado" debe ser "aprobado"
