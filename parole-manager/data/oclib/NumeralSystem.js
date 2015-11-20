/***********************************************************************************************************
 * com.oclib.javascript.math.events.20070204.NumeralSystem
 * Location: http://www.oclib.com/library/com/oclib/javascript/math/NumeralSystem.js
 * Version Location: http://www.oclib.com/library/com/oclib/javascript/math/numeralSystem/20070204/.js
 * Index Version Location: http://www.oclib.com/library/com/oclib/javascript/math/numeralSystem/20070204/index.html
 * © Open Class Library (http://www.oclib.com/)
 * See Also http://en.wikipedia.org/wiki/Numeral
 * See Also http://netzreport.googlepages.com/online_converter_for_numerals.html
 * See Also http://netzreport.googlepages.com/online_converter_for_dec_roman.html
***********************************************************************************************************/
if (typeof com == "undefined") {com = {};};
if (typeof com.oclib == "undefined") {com.oclib = {};};
if (typeof com.oclib.javascript == "undefined") {com.oclib.javascript = {};};
if (typeof com.oclib.javascript.math == "undefined") {com.oclib.javascript.math = {};};

if (typeof com.oclib.javascript.math.NumeralSystem == "undefined") {
 com.oclib.javascript.math.NumeralSystem = function() {} 
 com.oclib.javascript.math.NumeralSystem.prototype = new  com.oclib.javascript.lang.Root();

 com.oclib.javascript.math.NumeralSystem.prototype.className = "NumeralSystem"; 
 com.oclib.javascript.math.NumeralSystem.prototype.classNamespace = "com.oclib.javascript.math.NumeralSystem"; 
 com.oclib.javascript.math.NumeralSystem.prototype.classCreated = "20070204"; 
 com.oclib.javascript.math.NumeralSystem.prototype.classCreator = "http://www.oclib.com/"; 
 com.oclib.javascript.math.NumeralSystem.prototype.classLocation = "http://www.oclib.com/library/com/oclib/javascript/math/NumeralSystem.js"; 
 com.oclib.javascript.math.NumeralSystem.prototype.classIndexLocation = "http://www.oclib.com/library/com/oclib/javascript/math/events/"; 
 com.oclib.javascript.math.NumeralSystem.prototype.classVersion = "20070204"; 
 com.oclib.javascript.math.NumeralSystem.prototype.classVersionLocation = "http://www.oclib.com/library/com/oclib/javascript/math/events/20070204/NumeralSystem.js"; 
 com.oclib.javascript.math.NumeralSystem.prototype.classVersionIndexLocation = "http://www.oclib.com/library/com/oclib/javascript/math/events/20070204/"; 
 
 com.oclib.javascript.math.NumeralSystem.prototype.decimalNumerals = "0123456789"; 
  com.oclib.javascript.math.NumeralSystem.prototype.getDecimalNumerals = function () {return this.decimalNumerals;};
  com.oclib.javascript.math.NumeralSystem.prototype.setDecimalNumerals = function (decimalNumerals) {this.decimalNumerals = decimalNumerals; return 1;};
 com.oclib.javascript.math.NumeralSystem.prototype.fromNumerals = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; 
  com.oclib.javascript.math.NumeralSystem.prototype.getFromNumerals = function () {return this.fromNumerals;};
  com.oclib.javascript.math.NumeralSystem.prototype.setFromNumerals = function (fromNumerals) {this.fromNumerals = fromNumerals; return 1;};
 com.oclib.javascript.math.NumeralSystem.prototype.maxDecimal = 9999;
  com.oclib.javascript.math.NumeralSystem.prototype.getMaxDecimal = function () {return this.maxDecimal;};
  com.oclib.javascript.math.NumeralSystem.prototype.setMaxDecimal = function (maxDecimal) {this.maxDecimal = maxDecimal; return 1;};
 com.oclib.javascript.math.NumeralSystem.prototype.romanNumerals = "IVXLCDM"; 
  com.oclib.javascript.math.NumeralSystem.prototype.getRomanNumerals = function () {return this.romanNumerals;};
  com.oclib.javascript.math.NumeralSystem.prototype.setRomanNumerals = function (romanNumerals) {this.romanNumerals = romanNumerals; return 1;};
 com.oclib.javascript.math.NumeralSystem.prototype.maxRoman = 21; // largest Roman representation of a decimal numeral smaller than 10000 (MMMMMMMMMDCCCLXXXVIII = 9888)
  com.oclib.javascript.math.NumeralSystem.prototype.getMaxRoman = function () {return this.maxRoman;};
  com.oclib.javascript.math.NumeralSystem.prototype.setMaxRoman = function (maxRoman) {this.maxRoman = maxRoman; return 1;};
 com.oclib.javascript.math.NumeralSystem.prototype.simpleNumerals = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
  com.oclib.javascript.math.NumeralSystem.prototype.getSimpleNumerals = function () {return this.simpleNumerals;};
  com.oclib.javascript.math.NumeralSystem.prototype.setSimpleNumerals = function (simpleNumerals) {this.simpleNumerals = simpleNumerals; return 1;};
 com.oclib.javascript.math.NumeralSystem.prototype.toNumerals = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; 
  com.oclib.javascript.math.NumeralSystem.prototype.getToNumerals = function () {return this.toNumerals;};
  com.oclib.javascript.math.NumeralSystem.prototype.setToNumerals = function (toNumerals) {this.toNumerals = toNumerals; return 1;};
 
 // fromRadix, toRadix is decimal
 com.oclib.javascript.math.NumeralSystem.prototype.convert = function(fromNumber, fromRadix, toRadix) { 
  if(this.mustTrace()) {this.getLog().println("NumeralSystem.convert is runing...");};
  return this.convertFromDecimal(this.convertToDecimal(fromNumber, fromRadix), toRadix);
 };
 
 
 // fromRadix, toRadix = 2..36 and is decimal
 // fromNumber embody only this.numerals
 com.oclib.javascript.math.NumeralSystem.prototype.convert36 = function(fromNumber, fromRadix, toRadix) { 
  if(this.mustTrace()) {this.getLog().println("NumeralSystem.convert36 is runing...");};
  if(!fromNumber || !fromRadix || !toRadix) {return -1;};  
  // Remove spaces from beginning and end of string:
  fromNumber = "" + fromNumber;
  fromRadix = "" + fromRadix;
  toRadix = "" + toRadix;
  fromNumber = fromNumber.replace(/^ */g,"");
  fromRadix = fromRadix.replace(/^ */g,"");
  toRadix = toRadix.replace(/^ */g,"");
  fromNumber = fromNumber.replace(/ *$/g,"");
  fromRadix = fromRadix.replace(/ *$/g,"");
  toRadix = toRadix.replace(/ *$/g,"");  
  // Remove zeros from beginning of string:
  fromNumber = fromNumber.replace(/^0*/,"");
  fromRadix = fromRadix.replace(/^0*/,"");
  toRadix = toRadix.replace(/^0*/,"");  
  if(fromRadix == toRadix) {return fromNumber;};
  if(fromNumber == "" || fromRadix == "" || toRadix == "") {return -2;};
  if(fromRadix < 2 || fromRadix > 36 || toRadix < 2 || toRadix > 36 ) {return -3;};  
  // Check if input is a legal numeral:
  fromNumber = fromNumber.toUpperCase();
  var legalNumerals = this.simpleNumerals.substring(0, fromRadix);
  for (var i = 0; i < fromNumber.length; i++) {
   if (legalNumerals.indexOf(fromNumber.charAt(i)) == -1) {
    return -4;
   };
  };  
  var toNumber = "";
  // Convert to other numeral systems:
  // Get decimal value of input:
  var inputdecimal = parseInt(fromNumber, fromRadix);
  // Convert:
  return inputdecimal.toString(toRadix).toUpperCase();
 }; 

 com.oclib.javascript.math.NumeralSystem.prototype.convertDecimalToRoman = function(decimalNumber) {
  if(this.mustTrace()) {this.getLog().println("NumeralSystem.convertDecimalToRoman is runing... for decimalNumber = "+decimalNumber);};  
  if(!decimalNumber) {return -1};  
  // We are generous and allow unorthodox ways to write a decimal numeral:
  // Remove spaces from beginning and end of string:
  decimalNumber = "" + decimalNumber;
  decimalNumber = decimalNumber.replace(/^ */,"");
  decimalNumber = decimalNumber.replace(/ *$/,"");
  // Remove zeros from beginning of string:
  decimalNumber = decimalNumber.replace(/^0*/,"");
  if(decimalNumber == "") {return -2;};
  // Check if input is a legal decimal numeral:
  for (var i = 0; i < decimalNumber.length; i++) {
   if (this.decimalNumerals.indexOf(decimalNumber.charAt(i)) == -1) {return -3;};
  };
  // Check if decimal numeral is not too large:
  if (decimalNumber > this.maxDecimal) {return -4;};
  // Convert decimal to Roman numeral:
  var i = decimalNumber.length - 1; // now decimalNumber.charAt(i) gives us the last digit of decinput
  var romanNumber = "";
  // Now we convert the decimal numeral from right to left:
  while (i >= 0 ) {
    romanNumber = this.getRoman((decimalNumber.length - i), decimalNumber.charAt(i)) + romanNumber;
    i--;
  };
  return romanNumber;
 };

 // number and radix is decimal!
 com.oclib.javascript.math.NumeralSystem.prototype.convertFromDecimal = function(number, radix) {
  if(this.mustTrace()) {this.getLog().println("NumeralSystem.convertFromDecimal is runing... for number = "+number+"; radix = "+radix);};  
  if(!number || !radix) {return -1};  
  number = "" + number;
  radix = "" + radix;
  number = number.replace(/^ */g,"");
  radix = radix.replace(/^ */g,"");
  number = number.replace(/ *$/g,"");
  radix = radix.replace(/ *$/g,"");
  number = number.replace(/^0*/g,"");
  radix = radix.replace(/^0*/g,"");
  if(number == "" || radix == "") {return -2;};
  if(radix == 10) {return number;};
  for (var i = 0; i < number.length; i++) {
   if (this.decimalNumerals.indexOf(number.charAt(i)) == -1) {return -4;};
  };
  for (var i = 0; i < radix.length; i++) {
   if (this.decimalNumerals.indexOf(radix.charAt(i)) == -1) {return -4;};
  };
  var toNumerals = this.toNumerals.substring(0, radix);
  var radixNumber = "";
  while(number != 0) {
   var residue = number%radix;
   number = (number - residue)/radix;
   radixNumber = "" + toNumerals.charAt(residue) + radixNumber;
  };
  return radixNumber;
 };

 com.oclib.javascript.math.NumeralSystem.prototype.convertRomanToDecimal = function(romanNumber) {
  if(this.mustTrace()) {this.getLog().println("NumeralSystem.convertRomanToDecimal is runing... for romanNumber = "+romanNumber);};  
  if(!romanNumber) {return -1};
  // Generosity again! We remove empty spaces:
  romanNumber = romanNumber.replace(/ /g,"");
  if(romanNumber == "") {return -2;};
  // Check if input is a legal Roman numeral:
  romanNumber = romanNumber.toUpperCase();
  for (var i = 0; i < romanNumber.length; i++) {
   if (this.romanNumerals.indexOf(romanNumber.charAt(i)) == -1) {return -3;};
  };
  // Check if Roman numeral is not too large:
  if (romanNumber.length > this.maxRoman) {return -4;};
  // Convert Roman to decimal numeral:
  var decimalNumber = 0;
  var i = romanNumber.length - 1; // now romanNumber.charAt(i) shows us the last char of romanNumber
  while (i >= 0 ) {
   // Is subtractive notation used?:
   if (this.getDecimal(romanNumber.charAt(i)) < this.getDecimal(romanNumber.charAt(i+1))) {
    // Now we are verifying if sorting is correctly used with the subtractive notation.
    // The current character rominput.charAt(i) is put into brackets in the following comments:
    // Strings like [X]CC should be written as CXC:
    if ((i+2) <= (romanNumber.length - 1)) {  // is there a character two characters to the right?
     if (romanNumber.charAt(i+1) == romanNumber.charAt(i+2) ) {return -5;};
    };
    // Strings like [X]CIC should be written as ICXC:
    if ((i+3) <= (romanNumber.length - 1)) {  // is there a character three characters to the right?
     if (romanNumber.charAt(i+1) == romanNumber.charAt(i+3) ) {
      if (this.getDecimal(romanNumber.charAt(i)) > this.getDecimal(romanNumber.charAt(i+2))) {return -6;};
     };
    };
    // Strings like X[I]C should be written as ICX:
    if ((i-1) >= 0) {  // is there a character to the left?
     if (this.getDecimal(romanNumber.charAt(i-1)) < this.getDecimal(romanNumber.charAt(i+1))) {return -7;};
    };
    decimalNumber = decimalNumber - this.getDecimal(romanNumber.charAt(i));
   } else {
    decimalNumber = decimalNumber + this.getDecimal(romanNumber.charAt(i));
   };
   i--;
  };

  return decimalNumber;
 };

 // radix is decimal!
 com.oclib.javascript.math.NumeralSystem.prototype.convertToDecimal = function(number, radix) {
  if(this.mustTrace()) {this.getLog().println("NumeralSystem.convertToDecimal is runing... for number = "+number+"; radix = "+radix);};  
  if(!number || !radix) {return -1};  
  number = "" + number;
  radix = "" + radix;
  number = number.replace(/^ */g,"");
  radix = radix.replace(/^ */g,"");
  number = number.replace(/ *$/g,"");
  radix = radix.replace(/ *$/g,"");
  number = number.replace(/^0*/g,"");
  radix = radix.replace(/^0*/g,"");
  if(number == "" || radix == "") {return -2;};
  if(radix == 10) {return number;};
  var fromNumerals = this.fromNumerals.substring(0, radix);
  for (var i = 0; i < number.length; i++) {
   if (fromNumerals.indexOf(number.charAt(i)) == -1) {return -3;};
  };
  for (var i = 0; i < radix.length; i++) {
   if (this.decimalNumerals.indexOf(radix.charAt(i)) == -1) {return -4;};
  };
  var decimalNumber = 0;
  for(var i = 0; i < number.length; i++) {
   if(this.mustDebug()) {this.getLog().println("NumeralSystem.convertToDecimal decimalNumber = "+decimalNumber);};
   if(this.mustDebug()) {this.getLog().println("NumeralSystem.convertToDecimal decimalNumber += "+fromNumerals.indexOf(number.charAt(i))+"*Math.pow("+radix+","+number.length-i-1)+")";}; 
   decimalNumber += fromNumerals.indexOf(number.charAt(i))*Math.pow(radix,number.length-i-1);
  };
  return decimalNumber;
 };

 // Determine decimal value of a Roman numeral:
 com.oclib.javascript.math.NumeralSystem.prototype.getDecimal = function(roman) {
  if (roman == "I") return 1;
  if (roman == "V") return 5;
  if (roman == "X") return 10;
  if (roman == "L") return 50;
  if (roman == "C") return 100;
  if (roman == "D") return 500;
  if (roman == "M") return 1000;
  return 0;
 };

 com.oclib.javascript.math.NumeralSystem.prototype.getRoman = function(position, digit) {
  if(this.mustTrace()) {this.getLog().println("NumeralSystem.getRoman is runing...");};
  if (position == 1) {
   if (digit == 0) return "";
   if (digit == 1) return "I";
   if (digit == 2) return "II";
   if (digit == 3) return "III";
   if (digit == 4) return "IV";
   if (digit == 5) return "V";
   if (digit == 6) return "VI";
   if (digit == 7) return "VII";
   if (digit == 8) return "VIII";
   if (digit == 9) return "IX";
  };
  if (position == 2) {
   if (digit == 0) return "";
   if (digit == 1) return "X";
   if (digit == 2) return "XX";
   if (digit == 3) return "XXX";
   if (digit == 4) return "XL";
   if (digit == 5) return "L";
   if (digit == 6) return "LX";
   if (digit == 7) return "LXX";
   if (digit == 8) return "LXXX";
   if (digit == 9) return "XC";
  };
  if (position == 3) {
   if (digit == 0) return "";
   if (digit == 1) return "C";
   if (digit == 2) return "CC";
   if (digit == 3) return "CCC";
   if (digit == 4) return "CD";
   if (digit == 5) return "D";
   if (digit == 6) return "DC";
   if (digit == 7) return "DCC";
   if (digit == 8) return "DCCC";
   if (digit == 9) return "CM";
  };
  if (position == 4) {
   var roman = "";
   for (var i = 1; i <= digit; i++) {
    roman = roman + "M";
   };
   return roman;
  };
 };
};
