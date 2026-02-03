const { Eureka } = require('eureka-js-client');
const app = require('./api/index');

const client = new Eureka({
  instance: {
    app: 'store',
    instanceId: `store-${Math.floor(Math.random() * 10000)}`,
    hostName: 'store',
    ipAddr: 'store',
    port: { '$': 5000, '@enabled': true },
    vipAddress: 'store',
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn'
    }
  },
  eureka: {
    host: 'eureka-server',
    port: 8761,
    servicePath: '/eureka/apps/'
  }
});

client.start();
store.log("✅ Service store enregistré sur Eureka");

// 🔥 Démarrer le serveur Express après l'enregistrement sur Eureka
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
});