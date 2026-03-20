<template>
  <div class="page">
    <div class="container">

      <header class="header">
        <div class="logo-icon">📅</div>
        <div class="logo-text">
          <h1>Agendamentos</h1>
          <p>Gerencie as consultas da clínica</p>
        </div>
      </header>

      <!-- Form Card -->
      <div class="card">
        <div class="card-title">Nova Consulta</div>
        <form @submit.prevent="agendar">
          <div class="form-grid">
            <div class="input-wrap">
              <label>Paciente</label>
              <input v-model="form.paciente" type="text" placeholder="Nome do paciente" required />
            </div>
            <div class="input-wrap">
              <label>Médico</label>
              <input v-model="form.medico" type="text" placeholder="Nome do médico" required />
            </div>
            <div class="input-wrap">
              <label>Especialidade</label>
              <input v-model="form.especialidade" type="text" placeholder="Ex: Cardiologia" />
            </div>
            <div class="input-wrap">
              <label>Data</label>
              <input v-model="form.data" type="date" required @change="buscarClima" />
            </div>
            <div class="input-wrap full">
              <label>Hora</label>
              <input v-model="form.hora" type="time" required />
            </div>

            <!-- Clima -->
            <div class="clima-box full" v-if="clima">
              <span class="clima-icon">{{ clima.icon }}</span>
              <div>
                <div class="clima-temp">{{ clima.temp }}°C — {{ clima.desc }}</div>
                <div class="clima-info">Previsão para o dia da consulta em Niterói/RJ</div>
              </div>
            </div>

            <div class="full">
              <button type="submit" class="btn-submit" :disabled="loading">
                {{ loading ? 'Agendando...' : 'Agendar Consulta' }}
              </button>
            </div>
          </div>
        </form>
        <div class="toast" :class="{ show: mensagem, error: isError }">{{ mensagem }}</div>
      </div>

      <!-- Lista -->
      <div class="card">
        <div class="table-header">
          <div class="table-title">Consultas Agendadas</div>
          <span class="badge">{{ agendamentos.length }} consulta{{ agendamentos.length !== 1 ? 's' : '' }}</span>
        </div>

        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input v-model="busca" type="text" placeholder="Buscar por paciente ou médico..." />
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Especialidade</th>
                <th>Data</th>
                <th>Hora</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="agendamentosFiltrados.length === 0">
                <td colspan="7">
                  <div class="empty">
                    <div class="empty-icon">📭</div>
                    Nenhuma consulta agendada
                  </div>
                </td>
              </tr>
              <tr v-for="a in agendamentosFiltrados" :key="a._id">
                <td>
                  <div class="td-name">
                    <div class="avatar">{{ iniciais(a.paciente) }}</div>
                    {{ a.paciente }}
                  </div>
                </td>
                <td class="td-muted">{{ a.medico }}</td>
                <td class="td-muted">{{ a.especialidade || '---' }}</td>
                <td class="td-muted">{{ formatarData(a.data) }}</td>
                <td class="td-muted">{{ a.hora }}</td>
                <td>
                  <span class="status-badge" :class="a.status">{{ a.status }}</span>
                </td>
                <td>
                  <button class="btn-delete" @click="deletar(a._id)">✕</button>
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
import axios from 'axios';

const form = ref({ paciente: '', medico: '', especialidade: '', data: '', hora: '' });
const agendamentos = ref([]);
const busca = ref('');
const mensagem = ref('');
const isError = ref(false);
const loading = ref(false);
const clima = ref(null);

const token = localStorage.getItem('token');
const headers = { Authorization: `Bearer ${token}` };

const iniciais = (nome) =>
  nome.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

const formatarData = (data) => {
  if (!data) return '---';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
};

const agendamentosFiltrados = computed(() => {
  const q = busca.value.toLowerCase();
  return agendamentos.value.filter(a =>
    a.paciente.toLowerCase().includes(q) || a.medico.toLowerCase().includes(q)
  );
});

const buscarClima = async () => {
  if (!form.value.data) return;
  try {
    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=Niteroi,BR&appid=${API_KEY}&units=metric&lang=pt_br`
    );
    const dataEscolhida = form.value.data;
    const previsao = res.data.list.find(item => item.dt_txt.startsWith(dataEscolhida));
    if (previsao) {
      const desc = previsao.weather[0].description;
      const temp = Math.round(previsao.main.temp);
      const id = previsao.weather[0].id;
      const icon = id >= 200 && id < 300 ? '⛈️' :
                   id >= 300 && id < 600 ? '🌧️' :
                   id >= 600 && id < 700 ? '❄️' :
                   id >= 700 && id < 800 ? '🌫️' :
                   id === 800 ? '☀️' : '⛅';
      clima.value = { temp, desc, icon };
    } else {
      clima.value = null;
    }
  } catch {
    clima.value = null;
  }
};

const mostrarMensagem = (msg, erro = false) => {
  mensagem.value = msg;
  isError.value = erro;
  setTimeout(() => { mensagem.value = ''; }, 3000);
};

const buscarAgendamentos = async () => {
  try {
    const res = await axios.get('http://localhost:5000/agendamentos', { headers });
    agendamentos.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const agendar = async () => {
  loading.value = true;
  try {
    await axios.post('http://localhost:5000/agendamentos', form.value, { headers });
    mostrarMensagem('✅ Consulta agendada com sucesso!');
    form.value = { paciente: '', medico: '', especialidade: '', data: '', hora: '' };
    clima.value = null;
    buscarAgendamentos();
  } catch (err) {
    mostrarMensagem('❌ Erro ao agendar consulta', true);
  } finally {
    loading.value = false;
  }
};

const deletar = async (id) => {
  if (confirm('Cancelar esta consulta?')) {
    await axios.delete(`http://localhost:5000/agendamentos/${id}`, { headers });
    buscarAgendamentos();
  }
};

onMounted(buscarAgendamentos);
</script>

<style scoped>
.page { min-height: 100vh; padding: 48px 24px; }
.container { max-width: 960px; margin: 0 auto; }

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 48px;
  animation: fadeDown 0.6s ease both;
}

.logo-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #00d4a1, #0094ff);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 0 32px rgba(0,212,161,0.3);
}

.logo-text h1 {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 60%, #00d4a1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-text p { color: #6b7a99; font-size: 13px; margin-top: 2px; }

.card {
  background: #111827;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
  animation: fadeUp 0.6s ease both;
}

.card-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #00d4a1;
  margin-bottom: 24px;
}

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.full { grid-column: 1 / -1; }

.input-wrap label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: #6b7a99;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom: 6px;
}

input {
  width: 100%;
  background: #0d1526;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  padding: 13px 16px;
  color: #e8edf5;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input::placeholder { color: #6b7a99; }
input:focus { border-color: #00d4a1; box-shadow: 0 0 0 3px rgba(0,212,161,0.1); }

/* Clima */
.clima-box {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(0,212,161,0.08);
  border: 1px solid rgba(0,212,161,0.2);
  border-radius: 12px;
  padding: 14px 18px;
}

.clima-icon { font-size: 32px; }
.clima-temp { font-size: 15px; font-weight: 600; color: #e8edf5; }
.clima-info { font-size: 12px; color: #6b7a99; margin-top: 2px; }

.btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #00d4a1, #0094ff);
  border: none;
  border-radius: 10px;
  color: #0a0f1e;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.btn-submit:hover { opacity: 0.92; transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.toast {
  display: none;
  align-items: center;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
  margin-top: 16px;
  background: rgba(0,212,161,0.12);
  border: 1px solid rgba(0,212,161,0.3);
  color: #00d4a1;
}

.toast.show { display: flex; }
.toast.error { background: rgba(255,77,109,0.12); border-color: rgba(255,77,109,0.3); color: #ff4d6d; }

.table-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.table-title { font-size: 20px; font-weight: 700; color: #e8edf5; }
.badge { background: rgba(0,212,161,0.1); border: 1px solid rgba(0,212,161,0.2); color: #00d4a1; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; }

.search-wrap { position: relative; margin-bottom: 20px; }
.search-wrap input { padding-left: 40px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #6b7a99; font-size: 14px; pointer-events: none; }

.table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid rgba(255,255,255,0.07); }
table { width: 100%; border-collapse: collapse; }
thead th { background: #1a2235; padding: 12px 16px; font-size: 11px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: #6b7a99; text-align: left; white-space: nowrap; }
tbody tr { border-top: 1px solid rgba(255,255,255,0.07); transition: background 0.15s; }
tbody tr:hover { background: rgba(255,255,255,0.03); }
tbody td { padding: 14px 16px; font-size: 14px; color: #e8edf5; }

.td-name { font-weight: 500; display: flex; align-items: center; gap: 10px; white-space: nowrap; }
.avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #00d4a1, #0094ff); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #0a0f1e; flex-shrink: 0; }
.td-muted { color: #6b7a99; font-size: 13px; }

.status-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
.status-badge.agendado { background: rgba(0,212,161,0.1); color: #00d4a1; border: 1px solid rgba(0,212,161,0.2); }
.status-badge.cancelado { background: rgba(255,77,109,0.1); color: #ff4d6d; border: 1px solid rgba(255,77,109,0.2); }
.status-badge.concluido { background: rgba(0,148,255,0.1); color: #0094ff; border: 1px solid rgba(0,148,255,0.2); }

.btn-delete { background: rgba(255,77,109,0.1); border: 1px solid rgba(255,77,109,0.2); color: #ff4d6d; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; transition: background 0.2s, transform 0.15s; margin-left: auto; }
.btn-delete:hover { background: rgba(255,77,109,0.2); transform: scale(1.08); }

.empty { text-align: center; padding: 48px 16px; color: #6b7a99; font-size: 14px; }
.empty-icon { font-size: 36px; margin-bottom: 12px; opacity: 0.4; }

@keyframes fadeDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
  .full { grid-column: 1; }
}
</style>