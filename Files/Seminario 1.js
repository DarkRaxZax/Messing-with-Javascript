//Apuntes sobre Javascript
//Versión ALPHA-1.0
//Llamadas anidadas
//Suponiendo el método
function logBase(b){
  return function(x){
    return Math.log(x)/Math.log(b);
  }
}
/*Hallamos una función con una subfunción
  Esta función sirve para calcular el logaritmo en la base pasada en b
  Dado que este método se compone de dos partes, tenemos que diferenciar
  dos llamadas distintas:*/

log2 = logBase(2); //Define una "variable" asignada a la función en la que b = 2
log8 = logBase(8); //Exactamente igual, pero con b = 8

/*En este primer caso, la invocación accede a la parte superior de lobBase
  Sirven para definir atributos, son "instancias de función"

  Ahora observemos el segundo caso*/

  log2(1024); //Aquí, 1024 se convierte en la variable x
  log8(4096);

/*Por tanto, podemos definirlas como Instancia de función y Función
  Es un método efectivo de reutilización de código
  A efectos prácticos, el uso de instancias de función sería igual a decir

  public void patata(x){
    int b = VALOR DEPENDIENTE DE LA INSTANCIA;
    int respuesta = Math.log(x)/Math.log(b);
  }*/



//Objetos
/*El sistema de objetos y tipado de Javascript –apesta- es versátil
  Un objeto se crea enunciando una variable e incluyendo atributos */

var patata = {          //Vamos a construir patatas. Why not
  nombre : "Patata frita",        //Variable
  sePuedePoseer : false,          //Variable
  toString : function(){          //Función
    return this.nombre + ", Se puede poseer: " + this.sePuedePoseer;
  }
//Toda referencia a los elementos dentro del objeto se hacen con this
};

//Se puede imprimir por pantalla porque todo puede castearse a String
//"Viva" el tipado débil
console.log(patata);
console.log("\n" + patata.nombre + "\n");       //Acceso a variables del objeto
patata.toString();                              //Acceso a métodos del objeto

/* Antes de que entre hambre, los atributos del objeto son moldeables
  Pueden añadirse o eliminarse, e incluso modificarse sin setters/getters */

patata.tieneUnColorEspecial = true;   //Añade una variable a patata
delete patata.nombre;                 //Elimina la variable "nombre" de patata
patata.sePuedePoseer = true;          //Modifica una variable de patata
console.log(patata);
console.log("\n");



//Eventos, emisores, intervalos
/*Los eventos son "detectores" que pueden lanzarse al cumplirse
  una condición determinada. Comúnmente, los eventos requieren dos estructuras
  -El emisor, que normalmente se trata de un setInterval
  -El receptor de la emisión, que ejecuta una acción cuando se cumple */

//La cabecera de un programa que use eventos es:
var ev = require('events');
var emitter = new ev.EventEmitter;

//Los eventos usarán un String identificador para distinguirlos
var e1 = 'evento1';
var e2 = 'evento2';

//Para detectarlos, usaremos el método emitter.on
emitter.on(e1, function(){
  console.log("La patata no se puede poseer");
});

emitter.on(e2, function(){
  console.log("La patata es un fruto de la madre naturaleza");
});

//Podemos lanzar el evento usando emitter.emit()
emitter.emit(e1);
emitter.emit(e2);
