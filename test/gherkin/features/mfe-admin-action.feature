Feature: Gestión de solicitud de Mfe

    Scenario: Aprobar una solicitud MFe
    Given un administrador autenticado
    When envía una solicitud HTTPS [PUT] a "/admin/mfes-request/1b39a9d4-c80d-45ec-9b39-12feb8f25eeb/approve" con un mensaje
    Then la API para el manejo de administradores responde con código 200