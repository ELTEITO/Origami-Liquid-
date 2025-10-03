// Footer loader - Carga el componente footer dinámicamente
fetch("Footer/footer.html").then(r=>r.text()).then(html=>{
  document.getElementById("footer-placeholder").innerHTML = html;
});
