const APP = {}; //Membuat array untuk di Import
const pool = require('../db'); //Memanggil fungsi database
const moment = require('moment'); //Memanggil package moment untuk menangani tanggal dan waktu
const fs = require("fs") //Memanggil package fs untuk menangani folder dan file
const path = require('path'); //Memanggil package path untuk menangani rute file and folder
const { customAlphabet } = require('nanoid'); //Memanggil package nanoid untuk menangani random alpabet agar memudahkan penamaan

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'; //Kunci angka dan huruf untuk di acak
const nanoid = customAlphabet(alphabet, 22); //Deklarasi nanoid dengan customAlphabet(kunci, panjang karakter)

//req adalah parameter request untuk meminta/memberi fungsi/perintah ke server
//res adalah parameter response untuk membalas perintah dari server
//next adalah parameter untuk melanjutkan perintah

APP.index = (req, res, next) => {
  moment.locale("id") //Mengubah format tanggal dan waktu menjadi id ( Indonesia )
  
  /* Meminta value dari tag name="cari" di index.ejs melalui query.
  query terdapat di URL bar browser contoh : web.com?ini-query=value */
  const cari = req.query.cari;
  
  //Mengkondisikan variable cari
  if(cari){
    const mencari = '%'.concat(cari.concat('%')); //Membuat perintah untuk menampilkan data jika terlihat mirip
    console.log(mencari)
    pool.query("SELECT * FROM users WHERE name LIKE ?  ORDER BY id DESC",[mencari],function(err,result){
      res.render("index",{
        database:result, //Membuat properti database yang berisi value dari database berbentuk function
        moment:moment, //Membuat properti moment untuk menangani waktu
        tambah:req.flash("berhasilditambah"),
        ubah:req.flash("berhasildiubah"),
        hapus:req.flash("berhasildihapus")
      }) //Merespon perintah dengan menampilkan index.ejs
    })
  }else{
    pool.query("SELECT * FROM users ORDER BY id DESC",function(err,result){
      res.render("index",{
        database:result, //Membuat properti database yang berisi value dari database berbentuk function
        moment:moment, //Membuat properti moment untuk menangani waktu
        tambah:req.flash("berhasilditambah"),
        ubah:req.flash("berhasildiubah"),
        hapus:req.flash("berhasildihapus")
      }) //Merespon perintah dengan menampilkan index.ejs
    })
  }

};

APP.tambah = (req, res, next) => {
  res.render("tambah") //Merespon perintah dengan menampilkan tambah.ejs
};

APP.tambahPost = (req, res, next) => {
  const nama = req.body.nama; //Mengambil value nama dari tag name="nama"
  const photo = req.files.photo; //Mengambil value photo dari input
  const dirPath = "./src/public/images/"; //Lokasi untuk menyimpan photo
  const photo_name = nanoid() + path.extname(photo.name); //Membuat nama/judul acak dengan nanoid dan memberikan extensi/format dari gambar
  const photoPath = dirPath + photo_name //MRute untuk memindahkan foto dengan lokasi penyimpan dan nama foto
  const dateTime = moment().format('YYYY-MM-DD HH:mm:ss'); //Membuat variable waktu saat ini

  /* Variable photo berisi function karena memanggil dari req.files.photo
   yang merupakan fungsi dari package express-fileupload */
  photo.mv(photoPath, function (err) {
      console.log(err)
        pool.query(`INSERT INTO users (photo,name,create_at,update_at) VALUES ('${photo_name}','${nama}','${dateTime}','00-00-000 00:00:00')`, (err, result) => {
          //err adalah parameter jika terjadi error
          if (err) {
                //Jika error terjadi maka akan menampilkan pesan error 
                //res.send(err);
                res.send('Ini adalah pesan error'); //Bisa juga di custom seperti ini
                /* biasanya error terjadi karena relasi table yag tidak sesuai,database atau table tidak ada.
                dan masih banyak lagi tergantung project yang dibuat */
            } else {
                /* Jika tidak ada error maka akan kembali ke HALAMAN AWAL dengan membawa pesan berhasil
                dari fungsi package connect-flash */
                //req.flash("Inisial/parameter","Pesan/value yang ingin dikirim")
                req.flash('berhasilditambah', 'User baru berhasil ditambahkan !');
                res.redirect('/') //kembali ke route awal
            }
        })
    });

};
APP.ubah = (req, res, next) => {
  const id  = req.params.id //Mengambil id dari params
  pool.query("SELECT * FROM users WHERE id=?",[id],function(err,ambildata){
    res.render("ubah",{
      id:ambildata[0].id, //Menampilkan id dari database
      photo:ambildata[0].photo, //Menampilkan photo dari database
      name:ambildata[0].name //Menampilkan name dari database
    })
  })
};
APP.ubahPost = async (req, res, next) => {
  const id  = req.params.id //Mengambil id dari params
  const nama = req.body.nama; //Mengambil value nama dari tag name="nama"
  const dateTime = moment().format('YYYY-MM-DD HH:mm:ss'); //Membuat variable waktu saat ini

  //Membuat kondisi jika mengganti photo atau tidak
  if (!req.files || Object.keys(req.files).length === 0) {
    //Memperbaharui data yang diubah
    pool.query('UPDATE users SET name=?,update_at=?',[nama,dateTime], (err, result) => {
        if (err) {
            res.send('Ini adalah pesan Error'); //Jika terjadi error
        } else {
            req.flash('berhasildiubah', 'Data user berhasil diubah !'); //Pesan berhasil
            res.redirect('/') //Kembali ke halaman awal
        }
    })
}else{
  const photo = req.files.photo; //Mengambil value photo dari input
  const dirPath = "./src/public/images/"; //Lokasi untuk menyimpan photo
  const photo_name = nanoid() + path.extname(photo.name); //Membuat nama/judul acak dengan nanoid dan memberikan extensi/format dari gambar
  const photoPath = dirPath + photo_name //MRute untuk memindahkan foto dengan lokasi penyimpan dan nama foto
  
  //Mengambil data photo sebelumnya untuk dihapus dan digantikan yang baru
  const photoDelete = await pool.query('SELECT photo FROM users WHERE id =?', [id]) //Mengambil data foto
  fs.unlinkSync(dirPath + photoDelete[0].photo); //Menghapus foto sebelumnya
  photo.mv(photoPath, function (err) {
      pool.query('UPDATE users SET photo=?,name=?,update_at=?',[photo_name,nama,dateTime], (err, result) => {
        if (err) {
                res.send('Internal Server Error'); //Jika terjadi error
            } else {
              req.flash('berhasildiubah', 'Data user berhasil diubah !'); //Pesan berhasil
              res.redirect('/') //Kembali ke halaman awal
            }
    })
  });
}

};
APP.hapusPost = async (req, res, next) => {
  const id  = req.params.id //Mengambil id dari params
  const dirPath = "./src/public/images/"; //Lokasi untuk menyimpan photo

  //Mengambil data photo sebelumnya untuk dihapus
  const photoDelete = await pool.query('SELECT photo FROM users WHERE id =?', [id]) //Mengambil data foto
  fs.unlinkSync(dirPath + photoDelete[0].photo); //Menghapus foto sebelumnya
 
  /* Params berada di route router.post('/delete/:MY-PARAMS'.... */
  pool.query('DELETE FROM users WHERE id=?', [id], function (err, rows) {
    if (err) {
      res.send('Ini adalah pesan error');  //Jika terjadi error
    } else {
      req.flash('berhasildihapus', 'User berhasil dihapus !'); //Pesan berhasil
      res.redirect('/') //Kembali ke halaman awal
    }
  })
}; 
APP.testcss = (req, res, next) => {
  res.render("testcss")
}
module.exports = APP; //Mengimport module APP dengan fungsi module.exports