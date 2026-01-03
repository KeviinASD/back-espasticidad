import * as dotenv from 'dotenv';
import { Client } from 'pg';
import * as dns from 'dns';
import { promisify } from 'util';

// Cargar variables de entorno
dotenv.config();

const dnsLookup = promisify(dns.lookup);

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

async function testDnsLookup(hostname: string): Promise<void> {
  console.log('\n🔍 Paso 1: Verificando resolución DNS...');
  try {
    const result = await dnsLookup(hostname);
    console.log(`✅ DNS resuelto correctamente: ${hostname} → ${result.address}`);
    if (result.family === 4) {
      console.log(`   Tipo: IPv4`);
    } else if (result.family === 6) {
      console.log(`   Tipo: IPv6`);
    }
  } catch (error) {
    console.error(`❌ Error al resolver DNS para ${hostname}:`, error.message);
    throw error;
  }
}

async function testDatabaseConnection(config: DatabaseConfig): Promise<void> {
  console.log('\n🔌 Paso 2: Intentando conectar a PostgreSQL...');
  console.log(`   Host: ${config.host}`);
  console.log(`   Puerto: ${config.port}`);
  console.log(`   Base de datos: ${config.database}`);
  console.log(`   Usuario: ${config.user}`);
  console.log(`   Contraseña: ${config.password ? '***' : '(no configurada)'}`);

  const client = new Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    connectionTimeoutMillis: 10000, // 10 segundos para diagnóstico
    ssl: false, // SSL deshabilitado según la URL proporcionada
  });

  try {
    console.log('\n⏳ Conectando... (esto puede tardar hasta 10 segundos)');
    const startTime = Date.now();
    
    await client.connect();
    
    const connectionTime = Date.now() - startTime;
    console.log(`✅ ¡Conexión exitosa! (${connectionTime}ms)`);

    // Probar una consulta simple
    console.log('\n📊 Paso 3: Probando consulta SQL...');
    const queryStartTime = Date.now();
    const result = await client.query('SELECT version(), current_database(), current_user');
    const queryTime = Date.now() - queryStartTime;
    
    console.log(`✅ Consulta ejecutada exitosamente (${queryTime}ms)`);
    console.log('\n📋 Información de la base de datos:');
    console.log(`   PostgreSQL: ${result.rows[0].version}`);
    console.log(`   Base de datos: ${result.rows[0].current_database}`);
    console.log(`   Usuario: ${result.rows[0].current_user}`);

    // Listar algunas tablas
    console.log('\n📋 Paso 4: Listando tablas existentes...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name 
      LIMIT 10
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log(`✅ Encontradas ${tablesResult.rows.length} tablas:`);
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No se encontraron tablas en el esquema público');
    }

    await client.end();
    console.log('\n✅ Conexión cerrada correctamente');
    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');

  } catch (error) {
    console.error('\n❌ Error al conectar a la base de datos:');
    
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      console.error(`   Tipo: Timeout de conexión`);
      console.error(`   Mensaje: ${error.message}`);
      console.error('\n💡 Posibles causas:');
      console.error('   1. El servidor no está accesible desde tu red local');
      console.error('   2. El firewall está bloqueando el puerto 5427');
      console.error('   3. Necesitas una VPN para acceder al servidor remoto');
      console.error('   4. El servidor PostgreSQL está caído o no responde');
      console.error('   5. El puerto 5427 no está abierto en el servidor remoto');
      console.error('\n🔧 Soluciones sugeridas:');
      console.error('   - Contacta al administrador del servidor para verificar:');
      console.error('     * Si el servicio PostgreSQL está corriendo');
      console.error('     * Si el puerto 5427 está abierto en el firewall');
      console.error('     * Si tu IP está permitida en la configuración de PostgreSQL (pg_hba.conf)');
      console.error('   - Si es necesario, solicita acceso VPN o whitelist de tu IP');
    } else if (error.code === 'ENOTFOUND') {
      console.error(`   Código: ${error.code}`);
      console.error(`   Mensaje: ${error.message}`);
      console.error('\n💡 Problema de DNS:');
      console.error('   1. El hostname no se puede resolver');
      console.error('   2. Verifica que el dominio sea correcto');
      console.error('   3. Verifica tu conexión a Internet');
    } else if (error.code === 'ECONNREFUSED') {
      console.error(`   Código: ${error.code}`);
      console.error(`   Mensaje: ${error.message}`);
      console.error('\n💡 El servidor rechazó la conexión. Posibles causas:');
      console.error('   1. El servicio PostgreSQL no está corriendo');
      console.error('   2. El puerto está incorrecto');
      console.error('   3. El servidor no acepta conexiones desde tu IP');
    } else if (error.code === '28P01') {
      console.error(`   Código: ${error.code} (Error de autenticación)`);
      console.error(`   Mensaje: ${error.message}`);
      console.error('\n💡 Las credenciales son incorrectas:');
      console.error('   1. Verifica el usuario y contraseña en el archivo .env');
      console.error('   2. Asegúrate de que el usuario tenga permisos para acceder a la base de datos');
    } else if (error.code === '3D000') {
      console.error(`   Código: ${error.code} (Base de datos no existe)`);
      console.error(`   Mensaje: ${error.message}`);
      console.error('\n💡 La base de datos especificada no existe:');
      console.error('   1. Verifica el nombre de la base de datos en el archivo .env');
      console.error('   2. Crea la base de datos si es necesario');
    } else {
      console.error(`   Código: ${error.code || 'N/A'}`);
      console.error(`   Mensaje: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
    }
    
    throw error;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔧 DIAGNÓSTICO DE CONEXIÓN A POSTGRESQL');
  console.log('═══════════════════════════════════════════════════════════');

  // Obtener configuración desde variables de entorno
  const config: DatabaseConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'postgres',
  };

  console.log('\n📝 Configuración detectada desde .env:');
  console.log(`   DATABASE_HOST=${config.host}`);
  console.log(`   DATABASE_PORT=${config.port}`);
  console.log(`   DATABASE_USER=${config.user}`);
  console.log(`   DATABASE_NAME=${config.database}`);
  console.log(`   DATABASE_PASSWORD=${config.password ? '***' : '(no configurada)'}`);

  try {
    // Paso 1: Verificar DNS
    await testDnsLookup(config.host);

    // Paso 2: Intentar conectar
    await testDatabaseConnection(config);

  } catch (error) {
    console.error('\n═══════════════════════════════════════════════════════════');
    console.error('❌ DIAGNÓSTICO COMPLETADO CON ERRORES');
    console.error('═══════════════════════════════════════════════════════════');
    process.exit(1);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ DIAGNÓSTICO COMPLETADO EXITOSAMENTE');
  console.log('═══════════════════════════════════════════════════════════');
}

// Ejecutar el script
main().catch(error => {
  console.error('\n💥 Error fatal:', error);
  process.exit(1);
});

