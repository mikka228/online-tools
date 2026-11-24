(function () {
  var map = {
    'merge-pdf.html': 'merge-pdf',
    'compress-pdf.html': 'compress-pdf',
    'split-pdf.html': 'split-pdf',
    'organize-pdf.html': 'organize-pdf',
    'rotate-pdf.html': 'rotate-pdf',
    'jpg-to-pdf.html': 'jpg-to-pdf',
    'pdf-to-jpg.html': 'pdf-to-jpg',
    'compress.html': 'image-compressor',
    'batch-compress.html': 'batch-compress',
    'resize.html': 'resize',
    'convert.html': 'convert',
    'qr.html': 'qr',
    'json.html': 'json',
    'base64.html': 'base64',
    'timestamp.html': 'timestamp',
    'text-case.html': 'text-case',
    'password.html': 'password',
    'signature.html': 'signature',
    'lorem.html': 'lorem',
    'url-encode.html': 'url-encode',
    'uuid.html': 'uuid'
  };
  var path = (location.pathname.split('/').pop() || '').toLowerCase();
  var id = map[path];
  if (!id) return;
  try {
    var key = 'ot_recent';
    var list = JSON.parse(localStorage.getItem(key) || '[]').filter(function (x) { return x !== id; });
    list.unshift(id);
    localStorage.setItem(key, JSON.stringify(list.slice(0, 6)));
  } catch (e) {}
})();
