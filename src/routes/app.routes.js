const Router = require('express').Router; //Memanggil fungsi route dari framework ExpressJS
const router = Router(); //Deklarasi route

const { 

index,
tambah,
tambahPost,
ubah,
ubahPost,
hapusPost,
testcss

 } = require('../controllers/app.controller'); //Memanggil Array dari app.controller.js

//route awal
router.get('/', index);
router.get('/testcss',testcss)
//route tambah data
router.get('/tambah', tambah);
router.post('/tambah', tambahPost);

//route ubah data
router.get('/ubah/:id',ubah );
router.post('/ubah/:id', ubahPost);

//route delete data
router.post('/hapus/:id', hapusPost);

module.exports = router; //Mengimport module router dengan fungsi module.exports