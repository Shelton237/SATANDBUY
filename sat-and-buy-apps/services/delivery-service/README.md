# Delivery Service (scaffold)

Objectif : extraire la planification livreur/créneaux du monolithe.

## TODO
- Déplacer `driverBooking`, constantes de créneaux et futures entités (`Driver`, `DeliveryWindow`, `Assignment`).
- Synchroniser avec `order-service` via événements (`OrderReadyForDelivery`).
- Exposer des endpoints pour planifier / suivre les livraisons.
