const sharedCors = require('./packages/shared/src/utils/cors');

const origins = "https://console.dreamdigital.cm,https://store.dreamdigital.cm";
const option = sharedCors.buildCorsOriginOption(origins);

console.log('Type of option:', typeof option);

if (typeof option === 'function') {
    option('http://localhost:4000', (err, allowed) => {
        console.log('Request from localhost:4000 - Error:', err ? err.message : 'null', 'Allowed:', allowed);
    });
    option('https://console.dreamdigital.cm', (err, allowed) => {
        console.log('Request from console.dreamdigital.cm - Error:', err ? err.message : 'null', 'Allowed:', allowed);
    });
} else {
    console.log('Option value:', option);
}
