<template>
  <div id="app-clinica">
    <header class="topo" v-if="isLogado">
      <nav>
        <RouterLink to="/" class="logo">🏥 Clínica Inteligente</RouterLink>
        <div class="links">
          <RouterLink to="/">Pacientes</RouterLink>
          <RouterLink to="/agendamentos">Agendamentos</RouterLink>
          <RouterLink to="/admin">Admin</RouterLink>
          <button class="btn-logout" @click="logout">Sair</button>
        </div>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLogado = computed(() => !!localStorage.getItem('token'));

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  router.push('/login');
};
</script>

<style>

@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

body {
  font-family: 'DM Sans', sans-serif;
  background-color: #0a0f1e;
  color: #e8edf5;
}

#app-clinica {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse 80% 50% at 20% -10%, rgba(0,212,161,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 110%, rgba(0,148,255,0.1) 0%, transparent 60%),
    #0a0f1e;
}

.topo {
  background: rgba(10, 15, 30, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 960px;
  margin: 0 auto;
}

.logo {
  font-family: 'DM Serif Display', serif;
  font-size: 1.2rem;
  color: #00d4a1;
  text-decoration: none;
}

.links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.links a {
  color: #6b7a99;
  text-decoration: none;
  margin-left: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
  padding: 6px 12px;
  border-radius: 8px;
}

.links a:hover { color: #e8edf5; }
.links a.router-link-exact-active { color: #00d4a1; }

.btn-logout {
  background: rgba(255,77,109,0.1);
  border: 1px solid rgba(255,77,109,0.2);
  color: #ff4d6d;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-left: 8px;
  transition: background 0.2s;
}

.btn-logout:hover { background: rgba(255,77,109,0.2); }

main {
  flex: 1;
  display: flex;
  width: 100%;
}

main > * {
  flex: 1;
  width: 100%;
}
</style>