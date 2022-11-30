const { Router } = require('express');
const router = Router();
const BD = require('../config/configbd');

router.get('/pdb', async(req, res)=>{
    let result = await BD.Load_data();
    res.status(200).json(result)
})


router.get('/pdb/compare', async(req, res) =>{
    const { tipo, obj1, obj2, sch1, sch2 } = req.body;
    sql = "SELECT dbms_metadata_diff.compare_sxml(:tipo,:obj1,:obj2,:sch1,:sch2,'DL_PDB_DEV','DL_PDB_QAS') FROM dual"
    let resultado = await BD.Ejecutar(sql,[tipo, obj1, obj2, sch1, sch2]);
    res.json({'xml': resultado})

})


router.get('/pdb/ddl', async(req, res) =>{
    const { tipo, obj1, obj2, sch1, sch2 } = req.body;
    sql = `SELECT dbms_metadata_diff.compare_alter(:tipo,:obj1,:obj2,:sch1,:sch2,'DL_PDB_DEV','DL_PDB_QAS') FROM dual`
    let resultado = await BD.Ejecutar(sql,[tipo, obj1, obj2, sch1, sch2]);
    res.json({'ddl': resultado})

})


module.exports = router;