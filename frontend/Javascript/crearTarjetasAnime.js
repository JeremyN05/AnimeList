
function crearTarjetasAnime(){
    fetch("https://api.jikan.moe/v4/anime/52578")
        .then(respuesta => respuesta.json())
        .then(async datos => {

            const idAniList = await obtenerIdAniList(datos.data.mal_id);
            const temporadas = await obtenerTemporadas(idAniList);

            console.log("TEMPORADAS QUE VOY A MOSTRAR:", temporadas);

            console.log(datos);
            document.getElementById("imagen").src = datos.data.images.jpg.image_url;
            document.getElementById("titulo").textContent = datos.data.title;
            document.getElementById("anoEmision").textContent = `Año emitido: `+ datos.data.year;
            document.getElementById("temporadas").textContent = `Temporadas: `+ temporadas;
            document.getElementById("episodios").textContent =`Episodios: `+ datos.data.episodes;
    });
}

crearTarjetasAnime();

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
obtenerTemporadas(153152);

async function obtenerIdAniList(idMal) {

    const consulta = `
        query ($idMal: Int!) {
            Media(idMal: $idMal, type: ANIME) {
                id
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

    return datos.data.Media.id;
}

function abrirVentanaModal(){
    const modal = document.querySelector(".modal-overlay");

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