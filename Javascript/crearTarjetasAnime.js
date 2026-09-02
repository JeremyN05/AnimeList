
function crearTarjetasAnime(){
    const anime = {
        titulo: "Boku no Kokoro no Yabai Yatsu",
        año: 2023,
        temporadas: 2,
        episodios: 25,
        imagen: "../Imagenes/Boku_no_kokoro.jpg",
    }

    document.getElementById("titulo").textContent = anime.titulo;
    document.getElementById("anoEmision").textContent = `Año emitido: ${anime.año}`;
    document.getElementById("temporadas").textContent = `Temporadas: ${anime.temporadas}`;
    document.getElementById("episodios").textContent = `Episodios: ${anime.episodios}`;
    document.getElementById("imagen").src = anime.imagen;
    document.getElementById("imagen").alt = anime.titulo;

}

crearTarjetasAnime();

function abrirVentanaModal(){
    const modal = document.querySelector(".modal-overlay");

    modal.classList.add("open");
}

function cerrarVentanaModal(){
    const modal = document.querySelector(".modal-overlay");

    modal.classList.remove("open");
}