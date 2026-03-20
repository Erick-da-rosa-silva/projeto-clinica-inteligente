<template>
  <div class="page">
    <div class="container">

      <header class="header">
        <div class="logo-icon">🏥</div>
        <div class="logo-text">
          <h1>Clínica Inteligente</h1>
          <p>Sistema de Gestão de Pacientes</p>
        </div>
        <button @click="logout" class="btn-logout">Sair</button>
      </header>

      <div class="weather-widget" v-if="clima">
        <div class="weather-info">
          <img :src="`https://openweathermap.org/img/wn/${clima.weather[0].icon}@2x.png`" class="weather-img" />
          <div>
            <p class="weather-temp">{{ Math.round(clima.main.temp) }}°C</p>
            <p class="weather-desc">{{ clima.weather[0].description }} em Niterói</p>
          </div>
        </div>
        <div class="weather-tip">
          {{ clima.main.temp > 25 ? '🔥 Dia quente! Ar-condicionado ligado.' : '☁️ Clima agradável na clínica.' }}
        </div>
      </div>

      <div class="card">
        <div class="card-title">Novo Paciente</div>
        <form @submit.prevent="cadastrarPaciente">
          <div class="form-grid">
            <div class="input-wrap">
              <label>Nome Completo</label>
              <input v-model="paciente.nome" type="text" placeholder="Ex: João da Silva" required />
            </div>
            <div class="input-wrap">
              <label>CPF</label>
              <input v-model="paciente.cpf" type="text" placeholder="000.000.000-00" maxlength="14" @input="formatarCPF" required />
            </div>
            <div class="input-wrap">
              <label>Telefone</label>
              <input v-model="paciente.telefone" type="text" placeholder="(00) 00000-0000" maxlength="15" @input="formatarTelefone" />
            </div>
            <div class="input-wrap">
              <label>CEP</label>
              <input v-model="paciente.cep" type="text" placeholder="00000-000" maxlength="9" @blur="buscarEndereco" />
            </div>
            <div class="input-wrap full">
              <label>Endereço</label>
              <input v-model="paciente.endereco" type="text" placeholder="Preenchido automaticamente pelo CEP" />
            </div>
            <div class="full">
              <button type="submit" class="btn-submit" :disabled="loading">
                {{ loading ? 'Salvando...' : 'Cadastrar Paciente' }}
              </button>
            </div>
          </div>
        </form>
        <div class="toast" :class="{ show: mensagem }">{{ mensagem }}</div>
      </div>

      <div class="card">
        <div class="table-header">
          <div class="table-title">Pacientes Cadastrados</div>
          <span class="badge">{{ listaPacientes.length }} paciente{{ listaPacientes.length !== 1 ? 's' : '' }}</span>
        </div>

        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input v-model="termoBusca" type="text" placeholder="Buscar por nome ou CPF..." />
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Endereço</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pacientesFiltrados.length === 0">
                <td colspan="5">
                  <div class="empty">
                    <div class="empty-icon">🔎</div>
                    Nenhum paciente encontrado
                  </div>
                </td>
              </tr>
              <tr v-for="p in pacientesFiltrados" :key="p._id">
                <td>
                  <div class="td-name">
                    <div class="avatar">{{ iniciais(p.nome) }}</div>
                    {{ p.nome }}
                  </div>
                </td>
                <td class="td-muted">{{ p.cpf }}</td>
                <td class="td-muted">{{ p.telefone || '---' }}</td>
                <td class="td-muted">{{ p.endereco || '---' }}</td>
                <td>
                  <button class="btn-delete" @click="deletar(p._id)" title="Remover">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const paciente = ref({ nome: '', cpf: '', telefone: '', cep: '', endereco: '' });
const listaPacientes = ref([]);
const termoBusca = ref('');
const mensagem = ref('');
const loading = ref(false);
const clima = ref(null);

const API_KEY_CLIMA = 'cc84120ac43db4e5cc10494ab2b250ea';

// FUNÇÃO: Iniciais do Avatar
const iniciais = (nome) => 
  nome ? nome.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() : '??';

// FILTRO: Busca em tempo real
const pacientesFiltrados = computed(() => {
  const q = termoBusca.value.toLowerCase();
  return listaPacientes.value.filter(p =>
    p.nome.toLowerCase().includes(q) || p.cpf.includes(q)
  );
});

const dispararMensagem = (msg) => {
  mensagem.value = msg;
  setTimeout(() => { mensagem.value = ''; }, 3500);
};

// 🏠 LISTAR PACIENTES
const buscarPacientes = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');

    const res = await axios.get('http://localhost:5000/pacientes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    listaPacientes.value = res.data;
  } catch (err) {
    if (err.response?.status === 401) router.push('/login');
  }
};

// ➕ CADASTRAR PACIENTE
const cadastrarPaciente = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('token');
    await axios.post('http://localhost:5000/pacientes', paciente.value, {
      headers: { Authorization: `Bearer ${token}` }
    });

    dispararMensagem("✅ Paciente cadastrado com sucesso!");
    paciente.value = { nome: '', cpf: '', telefone: '', cep: '', endereco: '' };
    buscarPacientes();
  } catch (err) {
    if (err.response?.status === 400) {
      dispararMensagem("⚠️ Este CPF já está cadastrado!");
    } else {
      dispararMensagem("❌ Erro ao salvar paciente");
    }
  } finally {
    loading.value = false;
  }
};

// 🗑️ DELETAR PACIENTE
const deletar = async (id) => {
  if (confirm('Deseja realmente excluir este paciente?')) {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/pacientes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispararMensagem("🗑️ Paciente removido");
      buscarPacientes();
    } catch (err) {
      dispararMensagem("❌ Erro ao deletar");
    }
  }
};

// 📍 VIA CEP
const buscarEndereco = async () => {
  const cepLimpo = paciente.value.cep.replace(/\D/g, '');
  if (cepLimpo.length === 8) {
    try {
      const res = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      if (!res.data.erro) {
        paciente.value.endereco = `${res.data.logradouro}, ${res.data.bairro} - ${res.data.localidade}/${res.data.uf}`;
      }
    } catch (err) { console.error('Erro ViaCEP'); }
  }
};

// 🌤️ BUSCAR CLIMA
const buscarClima = async () => {
  try {
    const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Niteroi&units=metric&lang=pt_br&appid=${API_KEY_CLIMA}`);
    clima.value = res.data;
  } catch (err) { console.error("Erro Clima"); }
};

// Máscaras
const formatarCPF = (e) => {
  let v = e.target.value.replace(/\D/g, '');
  v = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  paciente.value.cpf = v;
};

const formatarTelefone = (e) => {
  let v = e.target.value.replace(/\D/g, '');
  v = v.replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  paciente.value.telefone = v;
};

const logout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};

onMounted(() => {
  buscarPacientes();
  buscarClima();
});
</script>

<style scoped>
.page { min-height: 100vh; padding: 48px 24px; color: #e8edf5; }
.container { max-width: 960px; margin: 0 auto; }
.header { display: flex; align-items: center; gap: 16px; margin-bottom: 40px; }
.btn-logout { margin-left: auto; background: none; border: 1px solid rgba(255,77,109,0.3); color: #ff4d6d; padding: 6px 12px; border-radius: 8px; cursor: pointer; }
.logo-icon { width: 52px; height: 52px; background: linear-gradient(135deg, #00d4a1, #0094ff); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 0 32px rgba(0,212,161,0.3); }
.logo-text h1 { font-family: 'DM Serif Display', serif; font-size: 28px; background: linear-gradient(135deg, #fff 60%, #00d4a1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.logo-text p { color: #6b7a99; font-size: 13px; }

/* Estilo Clima */
.weather-widget { background: linear-gradient(135deg, rgba(0,212,161,0.08), rgba(0,148,255,0.08)); border: 1px solid rgba(0,212,161,0.2); border-radius: 16px; padding: 12px 24px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
.weather-info { display: flex; align-items: center; gap: 8px; }
.weather-img { width: 45px; }
.weather-temp { font-size: 18px; font-weight: 700; }
.weather-desc { font-size: 11px; color: #00d4a1; text-transform: capitalize; }
.weather-tip { font-size: 11px; color: #6b7a99; font-style: italic; }

.card { background: #111827; border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 32px; margin-bottom: 24px; }
.card-title { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #00d4a1; margin-bottom: 24px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.full { grid-column: 1 / -1; }
input { width: 100%; background: #0d1526; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 13px 16px; color: #e8edf5; outline: none; }
input:focus { border-color: #00d4a1; }
.btn-submit { width: 100%; padding: 14px; background: linear-gradient(135deg, #00d4a1, #0094ff); border: none; border-radius: 10px; color: #0a0f1e; font-weight: 600; cursor: pointer; }
.toast { display: none; background: rgba(0,212,161,0.12); border: 1px solid rgba(0,212,161,0.3); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #00d4a1; margin-top: 16px; }
.toast.show { display: flex; }
.table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid rgba(255,255,255,0.07); }
table { width: 100%; border-collapse: collapse; }
thead th { background: #1a2235; padding: 12px 16px; font-size: 11px; color: #6b7a99; text-align: left; }
tbody tr:hover { background: rgba(255,255,255,0.03); }
tbody td { padding: 14px 16px; font-size: 14px; border-top: 1px solid rgba(255,255,255,0.07); }
.avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #00d4a1, #0094ff); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #0a0f1e; }
.btn-delete { background: rgba(255,77,109,0.1); border: 1px solid rgba(255,77,109,0.2); color: #ff4d6d; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; }
</style>