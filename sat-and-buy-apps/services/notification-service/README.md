# Notification Service (scaffold)

Préparation de l'extraction du module notifications (emails, push, sockets).

## TODO
- Déporter `notificationController` et les helpers d'envoi dans un package `notification-domain`.
- Consommer les évènements (`ORDER_PLACED`, `ORDER_DELIVERY_CONFIRMED`, etc.).
- Ajouter des canaux mail/SMS/WhatsApp selon les priorités.
