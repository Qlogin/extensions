/***********************************************************************************************************
 * com.oclib.javascript.security.events.20070130. MessageDigest
 * Location: http://www.oclib.com/library/com/oclib/javascript/security/MessageDigest.js
 * Version Location: http://www.oclib.com/library/com/oclib/javascript/security/messageDigest/20070130/.js
 * Index Version Location: http://www.oclib.com/library/com/oclib/javascript/security/messageDigest/20070130/index.html
 * © Open Class Library (http://www.oclib.com/)
***********************************************************************************************************/
if (typeof com == "undefined") {com = {};};
if (typeof com.oclib == "undefined") {com.oclib = {};};
if (typeof com.oclib.javascript == "undefined") {com.oclib.javascript = {};};
if (typeof com.oclib.javascript.security == "undefined") {com.oclib.javascript.security = {};};

if (typeof com.oclib.javascript.security.MessageDigest == "undefined") {
 com.oclib.javascript.security.MessageDigest = function() {} 
 com.oclib.javascript.security.MessageDigest.prototype = new  com.oclib.javascript.lang.Root();

 com.oclib.javascript.security.MessageDigest.prototype.className = "MessageDigest"; 
 com.oclib.javascript.security.MessageDigest.prototype.classNamespace = "com.oclib.javascript.security.MessageDigest"; 
 com.oclib.javascript.security.MessageDigest.prototype.classCreated = "20070130"; 
 com.oclib.javascript.security.MessageDigest.prototype.classCreator = "http://www.oclib.com/"; 
 com.oclib.javascript.security.MessageDigest.prototype.classLocation = "http://www.oclib.com/library/com/oclib/javascript/security/MessageDigest.js"; 
 com.oclib.javascript.security.MessageDigest.prototype.classIndexLocation = "http://www.oclib.com/library/com/oclib/javascript/security/events/"; 
 com.oclib.javascript.security.MessageDigest.prototype.classVersion = "20070130"; 
 com.oclib.javascript.security.MessageDigest.prototype.classVersionLocation = "http://www.oclib.com/library/com/oclib/javascript/security/events/20070130/MessageDigest.js"; 
 com.oclib.javascript.security.MessageDigest.prototype.classVersionIndexLocation = "http://www.oclib.com/library/com/oclib/javascript/security/events/20070130/"; 

 
 
 
 com.oclib.javascript.security.MessageDigest.prototype.AddUnsigned = function(lX,lY) {
  var lX4, lY4, lX8, lY8, lResult;
  lX8 = (lX & 0x80000000);
  lY8 = (lY & 0x80000000);
  lX4 = (lX & 0x40000000);
  lY4 = (lY & 0x40000000);
  lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
  if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
  if (lX4 | lY4) {
   if (lResult & 0x40000000) { 
    return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
   } else {
    return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
   };
  } else return (lResult ^ lX8 ^ lY8);
 };
 
 com.oclib.javascript.security.MessageDigest.prototype.ConvertToWordArray = function(sMessage) {
  var lWordCount;
  var lMessageLength = sMessage.length;
  var lNumberOfWords_temp1 = lMessageLength + 8;
  var lNumberOfWords_temp2 = (lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
  var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
  var lWordArray = Array(lNumberOfWords-1);
  var lBytePosition = 0;
  var lByteCount = 0;
  while (lByteCount < lMessageLength) {
   lWordCount = (lByteCount-(lByteCount % 4))/4;
   lBytePosition = (lByteCount % 4)*8;
   lWordArray[lWordCount] = (lWordArray[lWordCount] | (sMessage.charCodeAt(lByteCount)<<lBytePosition));
   lByteCount++;
  };
  lWordCount = (lByteCount-(lByteCount % 4))/4;
  lBytePosition = (lByteCount % 4)*8;
  lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
  lWordArray[lNumberOfWords-2] = lMessageLength<<3;
  lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
  return lWordArray;
 }
 
 com.oclib.javascript.security.MessageDigest.prototype.F = function(x,y,z) {return (x & y) | ((~x) & z);};
 
 com.oclib.javascript.security.MessageDigest.prototype.FF = function(a,b,c,d,x,s,ac) {
  a = this.AddUnsigned(a, this.AddUnsigned(this.AddUnsigned(this.F(b, c, d), x), ac));
  return this.AddUnsigned(this.RotateLeft(a, s), b);
 };
 
 com.oclib.javascript.security.MessageDigest.prototype.G = function(x,y,z) {return (x & z) | (y & (~z));};
 
 com.oclib.javascript.security.MessageDigest.prototype.getMD5 = function(message) { 
  if(this.mustTrace()) {this.getLog().println("MessageDigest.getMD5 is runing...");};
  return this.md5(message);
 };
 
 com.oclib.javascript.security.MessageDigest.prototype.getMd5 = function(message) { 
  if(this.mustTrace()) {this.getLog().println("MessageDigest.getmd5 is runing...");};
  return this.md5(message);
 };
 
 com.oclib.javascript.security.MessageDigest.prototype.getmd5 = function(message) { 
  if(this.mustTrace()) {this.getLog().println("MessageDigest.getmd5 is runing...");};
  return this.md5(message);
 };
 
 com.oclib.javascript.security.MessageDigest.prototype.GG = function(a,b,c,d,x,s,ac) {
  a = this.AddUnsigned(a, this.AddUnsigned(this.AddUnsigned(this.G(b, c, d), x), ac));
  return this.AddUnsigned(this.RotateLeft(a, s), b);
 };
 
 com.oclib.javascript.security.MessageDigest.prototype.H = function(x,y,z) {return (x ^ y ^ z);};
 
 com.oclib.javascript.security.MessageDigest.prototype.HH = function(a,b,c,d,x,s,ac) {
  a = this.AddUnsigned(a, this.AddUnsigned(this.AddUnsigned(this.H(b, c, d), x), ac));
  return this.AddUnsigned(this.RotateLeft(a, s), b);
 };
 
 com.oclib.javascript.security.MessageDigest.prototype.I = function(x,y,z) {return (y ^ (x | (~z)));};
 
 com.oclib.javascript.security.MessageDigest.prototype.II = function(a,b,c,d,x,s,ac) {
  a = this.AddUnsigned(a, this.AddUnsigned(this.AddUnsigned(this.I(b, c, d), x), ac));
  return this.AddUnsigned(this.RotateLeft(a, s), b);
 };
 
 com.oclib.javascript.security.MessageDigest.prototype.md5 = function(message) { 
  if(this.mustTrace()) {this.getLog().println("MessageDigest.md5 is runing...");};
  var k,AA,BB,CC,DD;
  var S11=7, S12=12, S13=17, S14=22;
  var S21=5, S22=9 , S23=14, S24=20;
  var S31=4, S32=11, S33=16, S34=23;
  var S41=6, S42=10, S43=15, S44=21;
  // Steps 1 and 2.  Append padding bits and length and convert to words
  var x=Array();
  x = this.ConvertToWordArray(message); // sMessage);
  // Step 3.  Initialise
  var a = 0x67452301;
  var b = 0xEFCDAB89;
  var c = 0x98BADCFE;
  var d = 0x10325476;
  // Step 4.  Process the message in 16-word blocks
  for (k=0; k<x.length; k+=16) {
   AA=a; BB=b; CC=c; DD=d;
   a = this.FF(a,b,c,d,x[k+0], S11, 0xD76AA478);
   d = this.FF(d,a,b,c,x[k+1], S12, 0xE8C7B756);
   c = this.FF(c,d,a,b,x[k+2], S13, 0x242070DB);
   b = this.FF(b,c,d,a,x[k+3], S14, 0xC1BDCEEE);
   a = this.FF(a,b,c,d,x[k+4], S11, 0xF57C0FAF);
   d = this.FF(d,a,b,c,x[k+5], S12, 0x4787C62A);
   c = this.FF(c,d,a,b,x[k+6], S13, 0xA8304613);
   b = this.FF(b,c,d,a,x[k+7], S14, 0xFD469501);
   a = this.FF(a,b,c,d,x[k+8], S11, 0x698098D8);
   d = this.FF(d,a,b,c,x[k+9], S12, 0x8B44F7AF);
   c = this.FF(c,d,a,b,x[k+10], S13, 0xFFFF5BB1);
   b = this.FF(b,c,d,a,x[k+11], S14, 0x895CD7BE);
   a = this.FF(a,b,c,d,x[k+12], S11, 0x6B901122);
   d = this.FF(d,a,b,c,x[k+13], S12, 0xFD987193);
   c = this.FF(c,d,a,b,x[k+14], S13, 0xA679438E);
   b = this.FF(b,c,d,a,x[k+15], S14, 0x49B40821);
   a = this.GG(a,b,c,d,x[k+1], S21, 0xF61E2562);
   d = this.GG(d,a,b,c,x[k+6], S22, 0xC040B340);
   c = this.GG(c,d,a,b,x[k+11], S23, 0x265E5A51);
   b = this.GG(b,c,d,a,x[k+0], S24, 0xE9B6C7AA);
   a = this.GG(a,b,c,d,x[k+5], S21, 0xD62F105D);
   d = this.GG(d,a,b,c,x[k+10], S22, 0x2441453);
   c = this.GG(c,d,a,b,x[k+15], S23, 0xD8A1E681);
   b = this.GG(b,c,d,a,x[k+4], S24, 0xE7D3FBC8);
   a = this.GG(a,b,c,d,x[k+9], S21, 0x21E1CDE6);
   d = this.GG(d,a,b,c,x[k+14], S22, 0xC33707D6);
   c = this.GG(c,d,a,b,x[k+3], S23, 0xF4D50D87);
   b = this.GG(b,c,d,a,x[k+8], S24, 0x455A14ED);
   a = this.GG(a,b,c,d,x[k+13], S21, 0xA9E3E905);
   d = this.GG(d,a,b,c,x[k+2], S22, 0xFCEFA3F8);
   c = this.GG(c,d,a,b,x[k+7], S23, 0x676F02D9);
   b = this.GG(b,c,d,a,x[k+12], S24, 0x8D2A4C8A);
   a = this.HH(a,b,c,d,x[k+5], S31, 0xFFFA3942);
   d = this.HH(d,a,b,c,x[k+8], S32, 0x8771F681);
   c = this.HH(c,d,a,b,x[k+11], S33, 0x6D9D6122);
   b = this.HH(b,c,d,a,x[k+14], S34, 0xFDE5380C);
   a = this.HH(a,b,c,d,x[k+1], S31, 0xA4BEEA44);
   d = this.HH(d,a,b,c,x[k+4], S32, 0x4BDECFA9);
   c = this.HH(c,d,a,b,x[k+7], S33, 0xF6BB4B60);
   b = this.HH(b,c,d,a,x[k+10], S34, 0xBEBFBC70);
   a = this.HH(a,b,c,d,x[k+13], S31, 0x289B7EC6);
   d = this.HH(d,a,b,c,x[k+0], S32, 0xEAA127FA);
   c = this.HH(c,d,a,b,x[k+3], S33, 0xD4EF3085);
   b = this.HH(b,c,d,a,x[k+6], S34, 0x4881D05);
   a = this.HH(a,b,c,d,x[k+9], S31, 0xD9D4D039);
   d = this.HH(d,a,b,c,x[k+12], S32, 0xE6DB99E5);
   c = this.HH(c,d,a,b,x[k+15], S33, 0x1FA27CF8);
   b = this.HH(b,c,d,a,x[k+2], S34, 0xC4AC5665);
   a = this.II(a,b,c,d,x[k+0], S41, 0xF4292244);
   d = this.II(d,a,b,c,x[k+7], S42, 0x432AFF97);
   c = this.II(c,d,a,b,x[k+14], S43, 0xAB9423A7);
   b = this.II(b,c,d,a,x[k+5], S44, 0xFC93A039);
   a = this.II(a,b,c,d,x[k+12], S41, 0x655B59C3);
   d = this.II(d,a,b,c,x[k+3], S42, 0x8F0CCC92);
   c = this.II(c,d,a,b,x[k+10], S43, 0xFFEFF47D);
   b = this.II(b,c,d,a,x[k+1], S44, 0x85845DD1);
   a = this.II(a,b,c,d,x[k+8], S41, 0x6FA87E4F);
   d = this.II(d,a,b,c,x[k+15], S42, 0xFE2CE6E0);
   c = this.II(c,d,a,b,x[k+6], S43, 0xA3014314);
   b = this.II(b,c,d,a,x[k+13], S44, 0x4E0811A1);
   a = this.II(a,b,c,d,x[k+4], S41, 0xF7537E82);
   d = this.II(d,a,b,c,x[k+11], S42, 0xBD3AF235);
   c = this.II(c,d,a,b,x[k+2], S43, 0x2AD7D2BB);
   b = this.II(b,c,d,a,x[k+9], S44, 0xEB86D391);
   a = this.AddUnsigned(a, AA); 
   b = this.AddUnsigned(b, BB); 
   c = this.AddUnsigned(c, CC); 
   d = this.AddUnsigned(d, DD);
  };
  // Output the 128 bit digest
  var temp = this.WordToHex(a)+this.WordToHex(b)+this.WordToHex(c)+this.WordToHex(d);
  return temp.toLowerCase();
 };
 
 com.oclib.javascript.security.MessageDigest.prototype.md5Test = function() { 
  if(this.mustTrace()) {this.getLog().println("MessageDigest.md5Test is runing...");};
  return this.md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
 };
 
 com.oclib.javascript.security.MessageDigest.prototype.RotateLeft = function(lValue, iShiftBits) {return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));};
 
 com.oclib.javascript.security.MessageDigest.prototype.WordToHex = function(lValue) {
  var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
  for (lCount = 0;lCount<=3;lCount++) {
   lByte = (lValue>>>(lCount*8)) & 255;
   WordToHexValue_temp = "0" + lByte.toString(16);
   WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
  };
  return WordToHexValue;
 }; 
};
