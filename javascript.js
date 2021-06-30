Es una función que transforma horas y minutos, a minutos. Es decir, esa función llamada totalMinutos recibe dos parámetros horas y minutos y devuelve el total, en cantidad de minutos. 

Ejemplo:

    totalMinutos(5, 25)// debe dar como resultado 325

    totalMinutos(1, 5) // debe dar como resultado 65

    totalMinutos(0, 15)// debe dar como resultado 15 */

function totalMinutos(minuto, hora) {
  hora = parseFloat(prompt("Digite la hora(s)"));
  minuto = parseFloat(prompt("Digite un minuto(s)"));
  if (!isNaN(hora) && !isNaN(minuto)) {
    return document.write(
      `<br> Ejercicio total de minutos <br> Hora(s): ${hora} <br> Minuto(s): ${minuto} <br> El total de minuto(s) es: ${
        minuto + hora * 60
      }`
    );
  } else
    document.write(
      "<br> Los valores digitados no son números, favor intentelo nuevamente."
    );
}

totalMinutos();
