// creación de selector de elementos únicos
const $ = (el) => document.querySelector(el);
// creación de selector de multiple elementos
const $$ = (el) => document.querySelectorAll(el);
//  elemento del input file
const imageInput = $("#image-input");
// elemento box donde quedan las imagenes
const itemsSection = $("#selector-items");
// elemento botón de reset
const resetButton = $("#reset-tier-button");
// elemento botón para guardar imagen
const saveButton = $("#save-tier-button");
// elemento a mover
let draggedElement = null;
// elemento padre del elemento a mover
let sourceContainer = null;
// elementos rows del tier list
const rows = $$(".tier .row");

// listener al presionar botón de subir imagenes
imageInput.addEventListener("change", (event) => {
	const { files } = event.target;
	useFilesToCreateItems(files);
});
// función para recibe archivos y los crea como item en selector-items
function useFilesToCreateItems(files) {
	if (files && files.length > 0) {
		Array.from(files).forEach((file) => {
			const reader = new FileReader();

			reader.onload = (eventReader) => {
				createItem(eventReader.target.result);
			};

			reader.readAsDataURL(file);
		});
	}
}
// función que genera una copia de las imagenes subidas
function createItem(src) {
	const imgElement = document.createElement("img");
	imgElement.draggable = true;
	imgElement.src = src;
	imgElement.className = "item-image";

	imgElement.addEventListener("dragstart", handleDragStart);
	imgElement.addEventListener("dragend", handleDragEnd);

	itemsSection.appendChild(imgElement);
	return imgElement;
}

// agregamos listener de drag para las filas del tier-list
rows.forEach((row) => {
	row.addEventListener("dragover", handleDragOver);
	row.addEventListener("drop", handleDrop);
	row.addEventListener("dragleave", handleDragLeave);
});
// agregamos listener de drag para el selector-items cuando viene desde la tier-list
itemsSection.addEventListener("dragover", handleDragOver);
itemsSection.addEventListener("drop", handleDrop);
itemsSection.addEventListener("dragleave", handleDragLeave);
// agregamos listener de drop para el selector-items cuando viene desde archivos del escritorio
itemsSection.addEventListener("drop", handleDropFromDesktop);
itemsSection.addEventListener("dragover", handleDragOverFromDesktop);

function handleDragOverFromDesktop(event) {
	event.preventDefault();

	const { currentTarget, dataTransfer } = event;

	if (dataTransfer.types.includes("Files")) {
		currentTarget.classList.add("drag-files");
	}
}

function handleDropFromDesktop(event) {
	event.preventDefault();
	const { currentTarget, dataTransfer } = event;

	if (dataTransfer.types.includes("Files")) {
		currentTarget.classList.remove("drag-files");
		const { files } = dataTransfer;
		useFilesToCreateItems(files);
	}
}

function handleDrop(event) {
	event.preventDefault();

	const { currentTarget, dataTransfer } = event;

	if (sourceContainer && draggedElement) {
		sourceContainer.removeChild(draggedElement);
	}

	if (draggedElement) {
		const src = dataTransfer.getData("text/plain");
		const imgElement = createItem(src);
		currentTarget.appendChild(imgElement);
	}

	currentTarget.classList.remove("drag-over");
	currentTarget.querySelector(".drag-preview")?.remove();
	guardaLocal();
}

function handleDragOver(event) {
	event.preventDefault();

	const { currentTarget, dataTransfer } = event;
	if (sourceContainer === currentTarget) return;

	currentTarget.classList.add("drag-over");

	const dragPreview = document.querySelector(".drag-preview");

	if (draggedElement && !dragPreview) {
		const previewElement = draggedElement.cloneNode(true);
		previewElement.classList.add("drag-preview");
		currentTarget.appendChild(previewElement);
	}
}

function handleDragLeave(event) {
	event.preventDefault();

	const { currentTarget } = event;
	currentTarget.classList.remove("drag-over");
	currentTarget.querySelector(".drag-preview")?.remove();
}

function handleDragStart(event) {
	draggedElement = event.target;
	sourceContainer = draggedElement.parentNode;
	event.dataTransfer.setData("text/plain", draggedElement.src);
}

function handleDragEnd(event) {
	draggedElement = null;
	sourceContainer = null;
}
// reseteamos los item y vuelven a selector-items
resetButton.addEventListener("click", () => {
	const items = $$(".tier .item-image");
	items.forEach((item) => {
		item.remove();
		itemsSection.appendChild(item);
	});
});
// guardamos la imagen y forzmaos la descarga
saveButton.addEventListener("click", () => {
	const tierContainer = $(".tier");
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	import("./html2canvas_pro_esm.js").then(({ default: html2canvas }) => {
		html2canvas(tierContainer).then((canvas) => {
			ctx.drawImage(canvas, 0, 0);
			const imgURL = canvas.toDataURL("image/png");

			const downloadLink = document.createElement("a");
			downloadLink.download = "tier.png";
			downloadLink.href = imgURL;
			downloadLink.click();
		});
	});
});

// Guardar y obtener listas desde localStorage
document.addEventListener("DOMContentLoaded", () => {
	const rows = document.querySelectorAll(".tier .row");
	// Agrega el evento 'input' a cada span
	rows.forEach((row) => {
		const span = row.querySelector("span");
		span.addEventListener("input", guardaLocal);
	});

	// Verifica si hay datos locales guardados y los carga
	checkLocal(rows);
});

// verificamos si existe una copia local
function checkLocal(rows) {
	let listTier = localStorage.getItem("listTier");
	if (listTier) {
		listTier = JSON.parse(listTier);
		rows.forEach((row, index) => {
			const span = row.querySelector("span");
			if (listTier.listas[index]) {
				span.innerHTML = listTier.listas[index].nombre;
			}
			listTier.listas[index].images.forEach((src) => {
				const img = createItem(src);
				row.appendChild(img);
			});
		});
	} else {
		// si no existe el tierlist lo creamos
		guardaLocal();
	}
}

// guardarmos una copia local
function guardaLocal() {
	const lista = { listas: [] };
	const rows = $$(".tier .row");
	rows.forEach((row, index) => {
		const span = row.querySelector("span");
		lista.listas.push({
			nombre: span.innerHTML,
			index: index,
			images: [],
		});
		const imagenes = row.querySelectorAll("img");
		imagenes.forEach((img) => {
			lista.listas[index].images.push(img.src);
		});
	});
	localStorage.setItem("listTier", JSON.stringify(lista));
}
