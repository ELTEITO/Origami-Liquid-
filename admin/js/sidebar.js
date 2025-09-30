// ==================== SIDEBAR COMPONENT INIT ====================
(function(){
  function loadSidebar(){
    const placeholder = document.getElementById('sidebar-placeholder');
    if(!placeholder) return;

    fetch('components/sidebar.html')
      .then(r=>r.text())
      .then(html=>{
        placeholder.innerHTML = html;
        initSidebarBehavior();
      })
      .catch(()=>{
        // Fallback simple
        placeholder.innerHTML = '<nav class="admin-sidebar"><div class="sidebar-header"><h2>Origami Admin</h2></div></nav>';
      });
  }

  function initSidebarBehavior(){
    const layout = document.querySelector('.admin-layout');
    const sidebar = document.querySelector('.admin-sidebar');
    const main = document.querySelector('.admin-main');
    if(!sidebar || !layout || !main) return;

    // Persisted collapsed state
    const collapsed = localStorage.getItem('admin_sidebar_collapsed') === '1';
    if(collapsed){
      layout.classList.add('sidebar-collapsed');
    }

    // Toggle button
    const toggleBtn = sidebar.querySelector('.sidebar-toggle');
    if(toggleBtn){
      toggleBtn.addEventListener('click', ()=>{
        layout.classList.toggle('sidebar-collapsed');
        localStorage.setItem('admin_sidebar_collapsed', layout.classList.contains('sidebar-collapsed') ? '1' : '0');
      });
    }

    // Mark active link
    const path = location.pathname.split('/').pop();
    sidebar.querySelectorAll('a').forEach(a=>{
      const href = a.getAttribute('href');
      if(href && href === path){
        a.classList.add('active');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', loadSidebar);
})();


