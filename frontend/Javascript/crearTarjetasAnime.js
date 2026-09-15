
const listaAnimes = [52578, 1535];

function crearTarjetasAnime(idAnime){
    console.log("ID que recibe:", idAnime);

    const contenedor = document.querySelector(".cuadradosAnime");

    fetch(`https://api.jikan.moe/v4/anime/${idAnime}`)
        .then(respuesta => respuesta.json())
        .then(async datos => {

            const idAniList = await obtenerIdAniList(datos.data.mal_id);
            const tituloIngles = idAniList.tituloIngles;

            console.log("Título en inglés:", tituloIngles);

            const temporadas = await obtenerTemporadas(idAniList.id);
            const episodios = await obtenerEpisodios(idAniList.id);
            const peliculas = await obtenerPeliculas(idAniList.id);
            const ovas = await obtenerOvas(idAniList.id);

            console.log("TEMPORADAS QUE VOY A MOSTRAR:", temporadas);
            console.log("PELÍCULAS QUE VOY A MOSTRAR:", peliculas);
            console.log("OVAS QUE VOY A MOSTRAR:", ovas);

            console.log(datos);

            const tarjeta = document.createElement("div");
            tarjeta.classList.add("anime");

            tarjeta.addEventListener("click", function(){
                abrirVentanaModal(datos, tituloIngles, temporadas, episodios);
            });

            const imagen = document.createElement("img");
            imagen.src = datos.data.images.jpg.image_url;

            tarjeta.appendChild(imagen);
            contenedor.appendChild(tarjeta);

            const infoAnime = document.createElement("div");
            infoAnime.classList.add("infoAnime");

            const titulo = document.createElement("h2");
            titulo.textContent = datos.data.title;

            infoAnime.appendChild(titulo);

            const anoEmision = document.createElement("p");
            anoEmision.textContent = `Año emitido: ${datos.data.year}`;

            infoAnime.appendChild(anoEmision);

            const temporadasTexto = document.createElement("p");
            temporadasTexto.textContent = `Temporadas: ${temporadas}`;

            infoAnime.appendChild(temporadasTexto);

            const episodiosTexto = document.createElement("p");
            episodiosTexto.textContent = `Episodios totales: ${episodios}`;

            infoAnime.appendChild(episodiosTexto);

            tarjeta.appendChild(infoAnime);

    });
}

for (const idAnime of listaAnimes) {

    crearTarjetasAnime(idAnime);

}

// Función que recibe el ID de un anime de AniList
// y obtiene sus relaciones para poder calcular sus temporadas
async function obtenerTemporadas(idAnime){

    // Consulta GraphQL que enviaremos a AniList
    const consulta = `

        query ($id: Int!){

            Media(id: $id, type: ANIME) {

                # Obtenemos las relaciones que tiene este anime
                relations{ 

                    # Cada relación se encuentra dentro de edges
                    edges{
                        
                        # Indica el tipo de relación:
                        # SEQUEL, PREQUEL, SIDE_STORY, etc.
                        relationType

                        node{
                            id
                            format
                            status
                            episodes
                        }

                    }

                }

            }

        }

    `;

    let idActual = idAnime;
    let temporadas = 1;

    while (idActual !== null) {
    
        console.log("Estoy consultando:", idActual);

        const respuesta = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

            body: JSON.stringify({
                query: consulta,
                variables: {
                    id: idActual
                }
            })
        });
    
        const datos = await respuesta.json();
        console.log(datos);

        const relaciones = datos.data.Media.relations.edges;

        let encontradaSecuela = false;

        for (const relacion of relaciones) {

            console.log(relacion.node.id, relacion.node.status);

            if (relacion.relationType === "SEQUEL") {

                if (relacion.node.format === "TV" && relacion.node.status === "FINISHED") {

                    temporadas++;

                    idActual = relacion.node.id;
                    encontradaSecuela = true;

                    console.log("He encontrado una temporada");
                    console.log("Nueva temporada:", idActual);

                }

            }

        }

        if (encontradaSecuela === false) {

            idActual = null;
        
        }
    
    }

    console.log("Total de temporadas:", temporadas);

    return temporadas;

}

// Probamos la función utilizando el ID de Boku no Kokoro no Yabai Yatsu
//obtenerTemporadas(153152);

// Función que recibe el ID de un anime de AniList
// y obtiene sus relaciones para poder calcular sus temporadas
async function obtenerEpisodios(idAnime){

    // Consulta GraphQL que enviaremos a AniList
    const consulta = `

        query ($id: Int!){

            Media(id: $id, type: ANIME) {

            episodes

                # Obtenemos las relaciones que tiene este anime
                relations{ 

                    # Cada relación se encuentra dentro de edges
                    edges{
                        
                        # Indica el tipo de relación:
                        # SEQUEL, PREQUEL, SIDE_STORY, etc.
                        relationType

                        node{
                            id
                            format
                            status
                            episodes
                        }

                    }

                }

            }

        }

    `;

    let idActual = idAnime;
    let episodiosTotales = 0;

    while (idActual !== null) {

        const respuesta = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

            body: JSON.stringify({
                query: consulta,
                variables: {
                    id: idActual
                }
            })
        });
    
        const datos = await respuesta.json();

        episodiosTotales += datos.data.Media.episodes;

        console.log(datos);

        const relaciones = datos.data.Media.relations.edges;

        let encontradaSecuela = false;

        for (const relacion of relaciones) {


            if (relacion.relationType === "SEQUEL") {

                if (relacion.node.format === "TV" && relacion.node.status === "FINISHED") {

                    console.log("Episodios de esta temporada:", datos.data.Media.episodes);

                    idActual = relacion.node.id;
                    encontradaSecuela = true;

                    console.log("Episodios", episodiosTotales);

                }

            }

        }

        if (encontradaSecuela === false) {

            idActual = null;
        
        }
    
    }

    console.log("Total de Episodios:", episodiosTotales);

    return episodiosTotales;

}

async function obtenerPeliculas(idAnime){
    
    // Consulta GraphQL que enviaremos a AniList
    const consulta = `

        query ($id: Int!){

            Media(id: $id, type: ANIME) {

            episodes

                # Obtenemos las relaciones que tiene este anime
                relations{ 

                    # Cada relación se encuentra dentro de edges
                    edges{
                        
                        # Indica el tipo de relación:
                        # SEQUEL, PREQUEL, SIDE_STORY, etc.
                        relationType

                        node{
                            id
                            format
                            status
                            episodes
                        }

                    }

                }

            }

        }

    `;

    let idActual = idAnime;
    let peliculastotales = 0;
    let peliculasEncontradas = [];

    while (idActual !== null) {

        const respuesta = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

        body: JSON.stringify({
            query: consulta,
            variables: {
                id: idActual
            }
        })
    });

    const datos = await respuesta.json();

    const relaciones = datos.data.Media.relations.edges;

    let peliEncontrada = false;

    for (const relacion of relaciones) {

        if (relacion.node.format === "MOVIE") {

                if (!peliculasEncontradas.includes(relacion.node.id)) {

                    peliculasEncontradas.push(relacion.node.id);
                    peliculastotales++;

                    console.log("Película encontrada:", relacion.node.id);
                    console.log("Películas totales:", peliculastotales);
                }
            }

            if (relacion.relationType === "SEQUEL" &&
                relacion.node.format === "TV" &&
                relacion.node.status === "FINISHED") {

                idActual = relacion.node.id;
                peliEncontrada = true;
            }
        }

        if (peliEncontrada === false) {
            idActual = null;
        }
    }

    return peliculastotales;

}

async function obtenerOvas(idAnime) {

    const consulta = `

        query ($id: Int!){

            Media(id: $id, type: ANIME) {

            episodes

                # Obtenemos las relaciones que tiene este anime
                relations{ 

                    # Cada relación se encuentra dentro de edges
                    edges{
                        
                        # Indica el tipo de relación:
                        # SEQUEL, PREQUEL, SIDE_STORY, etc.
                        relationType

                        node{
                            id
                            format
                            status
                        }

                    }

                }

            }

        }

    `;


    let idActual = idAnime;
    let ovasTotales = 0;
    let ovasEncontrados = [];

    while (idActual !== null) {

        const respuesta = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

            body: JSON.stringify({
            query: consulta,
                variables: {
                    id: idActual
                }
            })
        });

        const datos = await respuesta.json();

        const relaciones = datos.data.Media.relations.edges;

        let ovaEncontrado = false;

        for (const relacion of relaciones) {

            if (relacion.node.format === "OVA" || relacion.node.format === "ONA") {

                    if (!ovasEncontrados.includes(relacion.node.id)) {

                        ovasEncontrados.push(relacion.node.id);
                        ovasTotales++;

                        console.log("Ova encontrado:", relacion.node.id);
                        console.log("Ovas totales:", ovasTotales);
                    }
                }

            if (relacion.relationType === "SEQUEL" &&
                relacion.node.format === "TV" &&
                relacion.node.status === "FINISHED") {

                idActual = relacion.node.id;
                ovaEncontrado = true;
            }
        }

        if (ovaEncontrado === false) {
            idActual = null;
        }
    }

    return ovasTotales

}

// Probamos la función utilizando el ID de Boku no Kokoro no Yabai Yatsu
//obtenerEpisodios(153152);

async function obtenerIdAniList(idMal) {

    const consulta = `
        query ($idMal: Int!) {
            Media(idMal: $idMal, type: ANIME) {
                
                id
                title {
                    english
                }
            }
        }
    `;

    const respuesta = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            query: consulta,
            variables: {
                idMal: idMal
            }
        })
    });

    const datos = await respuesta.json();

    return {
        id: datos.data.Media.id,
        tituloIngles: datos.data.Media.title.english
    };
}

function abrirVentanaModal(datos, tituloIngles,  temporadas, episodios){
    const modal = document.querySelector(".modal-overlay");

    document.getElementById("imagenCuadroGrande").src = datos.data.images.jpg.image_url;
    document.getElementById("modalTitulo").textContent = datos.data.title;
    document.getElementById("modalSubtitulo").textContent = tituloIngles;
    document.getElementById("modalAnoEmision").textContent = "Año de emisión: " + datos.data.year;
    document.getElementById("modalTemporadas").textContent = `Temporadas: ${temporadas}`;
    document.getElementById("modalEpisodios").textContent = `Episodios totales: ${episodios}`;

    console.log(datos);

    modal.classList.add("open");
}

function cerrarVentanaModal(){
    const modal = document.querySelector(".modal-overlay");

    modal.classList.remove("open");
}

function contadorRever(){
    const revisiones = document.getElementById("contRevisiones");
    const partes = revisiones.textContent.split(":");

    let numeroRev = parseInt(partes[1]);

    let suma = numeroRev + 1;

    revisiones.textContent = "Revisiones: " + suma;
}