const oracledb = require('oracledb');

cns_cdb = {
    user: "sys",
    password: "oracle",
    connectString: "132.68.1.20:1521/DEV",
    privilege     : oracledb.SYSDBA
}

cns_dev = {
    user: "system",
    password: "oracle",
    connectString: "132.68.1.20:1521/pdb_dev"
}

cns_qas = {
    user: "system",
    password: "oracle",
    connectString: "132.68.1.20:1521/pdb_qas"
}

async function Load_data() {
    let result = {};
    let cnn_dev;
    let cnn_qas;
    try {
        cnn_dev = await oracledb.getConnection(cns_dev);
        cnn_qas = await oracledb.getConnection(cns_qas);
        consultas = [
            `SELECT DB_LINK FROM DBA_DB_LINKS`,
            `SELECT USERNAME FROM DBA_USERS`,
            `SELECT TABLE_NAME, OWNER FROM DBA_ALL_TABLES`,
            `SELECT TABLESPACE_NAME FROM DBA_TABLESPACES`,
            `SELECT INDEX_NAME, OWNER FROM ALL_INDEXES`,
            `SELECT NAME FROM ALL_SNAPSHOTS`,
            `SELECT QUEUE_TABLE, OWNER FROM DBA_QUEUE_TABLES`,
            `SELECT NAME, OWNER FROM DBA_QUEUES`,
            `SELECT ROLE FROM DBA_ROLES`,
            `SELECT CLUSTER_NAME FROM DBA_CLUSTERS`,
            `SELECT TYPE_NAME FROM DBA_TYPES`,
            `SELECT SEQUENCE_NAME FROM DBA_SEQUENCES`

        
        ]
        objetos = ['DB_LINK', 'USER', 'TABLE', 'TABLESPACE', 'INDEX', 'MATERIALIZED_VIEW',
        'AQ_QUEUE_TABLE', 'AQ_QUEUE', 'ROLE','CLUSTER','SEQUENCE','TYPE']
        datos_dev = []
        datos_qas = []
        for (n in consultas) {
            let objeto1 = {};
            let objeto2 = {};
            let resp1 = await cnn_dev.execute(consultas[n],[],
                {resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT})
            let resp2 = await cnn_qas.execute(consultas[n],[],
                {resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT})
            const rs1 = resp1.resultSet;
            const rs2 = resp2.resultSet;
            let datos1 = []
            let datos2 = []
            let row1;
            while ((row1 = await rs1.getRow())){
                let elementos = Object.values(row1)
                datos1.push(elementos)
            }
            let row2;
            while ((row2 = await rs2.getRow())){
                let elementos = Object.values(row2)
                datos2.push(elementos)
            }
            objeto1[objetos[n]]=datos1
            datos_dev.push(objeto1)
            objeto2[objetos[n]]=datos2
            datos_qas.push(objeto2)
            await rs1.close()
            await rs2.close()
        }
        result['datos_dev']=datos_dev
        result['datos_qas']=datos_qas
        return result;
    } catch (err) {
        console.error(err);
      } finally {
        if (cnn_dev) {
          try {
            await cnn_dev.close();
            await cnn_qas.close();
          } catch (err) {
            console.error(err);
          }
        }
      }
    
}

async function Ejecutar(sql,binds){
    let cnn_cdb;
    try{
        cnn_cdb = await oracledb.getConnection(cns_cdb);
        oracledb.fetchAsString = [oracledb.DB_TYPE_CLOB]
        let resp = await cnn_cdb.execute(sql,binds,
            {resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT})
        const rs = resp.resultSet;
        console.log("META:", resp.resultSet._readableState)
        let row;
        let result = [];
        while ((row = await rs.getRow())){
            let elementos = Object.values(row)
            result.push(elementos);
        }
        await rs.close()
        return result;
    }catch (err) {
        console.error(err);
      } finally {
        if (cnn_cdb) {
          try {
            await cnn_cdb.close();
          } catch (err) {
            console.error(err);
          }
        }
    }
}

exports.Load_data = Load_data;
exports.Ejecutar = Ejecutar;