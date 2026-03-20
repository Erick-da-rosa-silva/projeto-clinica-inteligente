<template>
  <div class="page">
    <div class="container">

      <header class="header">
        <div class="logo-icon">⚙️</div>
        <div class="logo-text">
          <h1>Painel Administrativo</h1>
          <p>Visão geral do sistema</p>
        </div>
      </header>

      <!-- Cards de estatísticas -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <div class="stat-number">{{ totalPacientes }}</div>
            <div class="stat-label">Pacientes</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <div class="stat-number">{{ totalAgendamentos }}</div>
            <div class="stat-label">Agendamentos</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-number">{{ agendados }}</div>
            <div class="stat-label">Agendados</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">❌</div>
          <div class="stat-info">
            <div class="stat-number">{{ cancelados }}</div>
            <div class="stat-label">Cancelados</div>
          </div>
        </div>
      </div>

      <!-- Próximas consultas -->
      <div class="card">
        <div class="card-title">Próximas Consultas</div>
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
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="agendamentos.length === 0">
                <td colspan="7">
                  <div class="empty">
                    <div class="empty-icon">📭</div>
                    Nenhuma consulta agendada
                  </div>
                </td>
              </tr>
              <tr v-for="a in agendamentos" :key="a._id">
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
                  <select class="select-status" @change="mudarStatus(a._id, $event.target.value)" :value="a.status">
                    <option value="agendado">Agendado</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Lista de pacientes -->
      <div class="card">
        <div class="card-title">Pacientes Cadastrados</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Endereço</th>
                <th>Cadastro</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pacientes.length === 0">
                <td colspan="5">
                  <div class="empty">
                    <div class="empty-icon">👥</div>
                    Nenhum paciente cadastrado
                  </div>
                </td>
              </tr>
              <tr v-for="p in pacientes" :key="p._id">
                <td>
                  <div class="td-name">
                    <div class="avatar">{{ iniciais(p.nome) }}</div>
                    {{ p.nome }}
                  </div>
                </td>
                <td class="td-muted">{{ p.cpf }}</td>
                <td class="td-muted">{{ p.telefone || '---' }}</td>
                <td class="td-muted">{{ p.endereco || '---' }}</td>
                <td class="td-muted">{{ formatarData(p.dataCadastro?.split('T')[0]) }}</td>
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

const pacientes = ref([]);
const agendamentos = ref([]);

const token = localStorage.getItem('token');
const headers = { Authorization: `Bearer ${token}` };

const totalPacientes = computed(() => pacientes.value.length);
const totalAgendamentos = computed(() => agendamentos.value.length);
const agendados = computed(() => agendamentos.value.filter(a => a.status === 'agendado').length);
const cancelados = computed(() => agendamentos.value.filter(a => a.status === 'cancelado').length);

const iniciais = (nome) =>
  nome.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

const formatarData = (data) => {
  if (!data) return '---';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
};

const mudarStatus = async (id, status) => {
  await axios.patch(`http://localhost:5000/agendamentos/${id}`, { status }, { headers });
  const ag = agendamentos.value.find(a => a._id === id);
  if (ag) ag.status = status;
};

onMounted(async () => {
  const [resPacientes, resAgendamentos] = await Promise.all([
    axios.get('http://localhost:5000/pacientes', { headers }),
    axios.get('http://localhost:5000/agendamentos', { headers }),
  ]);
  pacientes.value = resPacientes.data;
  agendamentos.value = resAgendamentos.data;
});
</script>

<style scoped>
.page { min-height: 100vh; padding: 48px 24px; }
.container { max-width: 960px; margin: 0 auto; }

.header { display: flex; align-items: center; gap: 16px; margin-bottom: 48px; animation: fadeDown 0.6s ease both; }

.logo-icon { width: 52px; height: 52px; background: linear-gradient(135deg, #00d4a1, #0094ff); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 0 32px rgba(0,212,161,0.3); }

.logo-text h1 { font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #fff 60%, #00d4a1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.logo-text p { color: #6b7a99; font-size: 13px; margin-top: 2px; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }

.stat-card { background: #111827; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 16px; animation: fadeUp 0.6s ease both; }

.stat-icon { font-size: 32px; }
.stat-number { font-size: 28px; font-weight: 700; color: #00d4a1; }
.stat-label { font-size: 12px; color: #6b7a99; margin-top: 2px; }

.card { background: #111827; border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 32px; margin-bottom: 24px; animation: fadeUp 0.6s ease both; }

.card-title { font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #00d4a1; margin-bottom: 24px; }

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

.select-status { background: #0d1526; border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 6px 10px; color: #e8edf5; font-size: 12px; outline: none; cursor: pointer; }

.empty { text-align: center; padding: 48px 16px; color: #6b7a99; font-size: 14px; }
.empty-icon { font-size: 36px; margin-bottom: 12px; opacity: 0.4; }

@keyframes fadeDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 600px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>