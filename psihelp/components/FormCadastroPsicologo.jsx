'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/styles/components.module.css';

const abordagensOpcoes = [
  "Terapia Cognitivo-Comportamental",
  "Psicanálise Lacaniana",
  "Psicologia Existencial",
  "Terapia Sistêmica",
  "Terapia Comportamental Dialética",
  "Mindfulness",
  "Terapia de Aceitação e Compromisso"
];

const diasSemana = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
const horarios = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

export default function FormCadastroPsicologo() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    nome: '',
    crp: '',
    email: user?.email || '',
    telefone: '',
    abordagens: [],
    formacao: '',
    especializacoes: '',
    disponibilidade: [],
    preco: '',
    modalidade: 'online',
    cidade: '',
    estado: '',
    endereco: '',
    descricao: ''
  });
  
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [disponibilidadeTemp, setDisponibilidadeTemp] = useState({ dia: '', horario: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAbordagemToggle = (ab) => {
    const novas = formData.abordagens.includes(ab)
      ? formData.abordagens.filter(a => a !== ab)
      : [...formData.abordagens, ab];
    setFormData(prev => ({ ...prev, abordagens: novas }));
  };

  const adicionarDisponibilidade = () => {
    if (!disponibilidadeTemp.dia || !disponibilidadeTemp.horario) return;
    const novaDispo = [...formData.disponibilidade];
    const existente = novaDispo.find(d => d.dia === disponibilidadeTemp.dia);
    if (existente) {
      if (!existente.horarios.includes(disponibilidadeTemp.horario)) {
        existente.horarios.push(disponibilidadeTemp.horario);
      }
    } else {
      novaDispo.push({
        dia: disponibilidadeTemp.dia,
        horarios: [disponibilidadeTemp.horario]
      });
    }
    setFormData(prev => ({ ...prev, disponibilidade: novaDispo }));
    setDisponibilidadeTemp({ dia: '', horario: '' });
  };

  const removerHorario = (dia, horario) => {
    const novaDispo = formData.disponibilidade.map(d => {
      if (d.dia === dia) {
        const novosHorarios = d.horarios.filter(h => h !== horario);
        return { ...d, horarios: novosHorarios };
      }
      return d;
    }).filter(d => d.horarios.length > 0);
    setFormData(prev => ({ ...prev, disponibilidade: novaDispo }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
    if (!formData.crp) newErrors.crp = 'CRP é obrigatório';
    else if (!/^\d{2}\/\d{5}$/.test(formData.crp)) newErrors.crp = 'CRP inválido (formato NN/XXXXX)';
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    if (!formData.telefone) newErrors.telefone = 'Telefone é obrigatório';
    if (formData.abordagens.length === 0) newErrors.abordagens = 'Selecione pelo menos uma abordagem';
    if (!formData.formacao) newErrors.formacao = 'Formação acadêmica é obrigatória';
    if (!formData.preco || formData.preco <= 0) newErrors.preco = 'Preço deve ser maior que zero';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    const especializacoesArray = formData.especializacoes.split(',').map(s => s.trim());
    
    const novoPsicologo = {
      nome: formData.nome,
      crp: formData.crp,
      email: formData.email,
      telefone: formData.telefone,
      abordagens: formData.abordagens,
      formacao: formData.formacao,
      especializacoes: especializacoesArray,
      disponibilidade: formData.disponibilidade,
      preco: Number(formData.preco),
      modalidade: formData.modalidade,
      localizacao: {
        cidade: formData.cidade,
        estado: formData.estado,
        endereco: formData.modalidade === 'online' ? 'Atendimento online' : formData.endereco
      },
      descricao: formData.descricao,
      foto: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 100)}.jpg`,
    };
    
    try {
      const response = await fetch('/api/psicologos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoPsicologo)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccessMsg('Cadastro realizado com sucesso! Aguardando validação por nossos professores de psicologia.');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setErrors({ submit: data.error });
      }
    } catch (error) {
      setErrors({ submit: 'Erro ao cadastrar. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Cadastro de Psicólogo - Conformidade CFP</h2>
      <p className={styles.formDisclaimer}>
        Todos os cadastros são revisados manualmente por professores de psicologia e psicólogos atuantes.
      </p>
      
      {successMsg && <div className={styles.successMsg}>{successMsg}</div>}
      {errors.submit && <div className={styles.errorBox}>{errors.submit}</div>}
      
      <form onSubmit={handleSubmit} className={styles.cadastroForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Nome completo *</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} />
            {errors.nome && <span className={styles.error}>{errors.nome}</span>}
          </div>
          <div className={styles.formGroup}>
            <label>CRP (formato NN/XXXXX) *</label>
            <input type="text" name="crp" placeholder="04/51234" value={formData.crp} onChange={handleChange} />
            {errors.crp && <span className={styles.error}>{errors.crp}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Email profissional *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>
          <div className={styles.formGroup}>
            <label>Telefone (com DDD) *</label>
            <input type="tel" name="telefone" placeholder="(31) 99999-1234" value={formData.telefone} onChange={handleChange} />
            {errors.telefone && <span className={styles.error}>{errors.telefone}</span>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Formação acadêmica *</label>
          <input type="text" name="formacao" value={formData.formacao} onChange={handleChange} />
          {errors.formacao && <span className={styles.error}>{errors.formacao}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Especializações (separadas por vírgula)</label>
          <input type="text" name="especializacoes" value={formData.especializacoes} onChange={handleChange} />
        </div>

        <div className={styles.formGroup}>
          <label>Abordagens terapêuticas *</label>
          <div className={styles.checkboxGrid}>
            {abordagensOpcoes.map(ab => (
              <label key={ab} className={styles.checkboxLabel}>
                <input type="checkbox" checked={formData.abordagens.includes(ab)} onChange={() => handleAbordagemToggle(ab)} />
                {ab}
              </label>
            ))}
          </div>
          {errors.abordagens && <span className={styles.error}>{errors.abordagens}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Modalidade de atendimento *</label>
          <select name="modalidade" value={formData.modalidade} onChange={handleChange}>
            <option value="online">Online</option>
            <option value="presencial">Presencial</option>
          </select>
        </div>

        {formData.modalidade === 'presencial' && (
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Cidade *</label>
              <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label>Estado (UF) *</label>
              <input type="text" name="estado" value={formData.estado} onChange={handleChange} maxLength="2" />
            </div>
            <div className={styles.formGroup}>
              <label>Endereço completo *</label>
              <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} />
            </div>
          </div>
        )}

        {formData.modalidade === 'online' && (
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Cidade (para referência)</label>
              <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label>Estado</label>
              <input type="text" name="estado" value={formData.estado} onChange={handleChange} maxLength="2" />
            </div>
          </div>
        )}

        <div className={styles.formGroup}>
          <label>Preço por sessão (R$) *</label>
          <input type="number" name="preco" value={formData.preco} onChange={handleChange} step="10" />
          {errors.preco && <span className={styles.error}>{errors.preco}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Disponibilidade de horários</label>
          <div className={styles.disponibilidadeInput}>
            <select value={disponibilidadeTemp.dia} onChange={(e) => setDisponibilidadeTemp({...disponibilidadeTemp, dia: e.target.value})}>
              <option value="">Dia</option>
              {diasSemana.map(dia => <option key={dia} value={dia}>{dia}</option>)}
            </select>
            <select value={disponibilidadeTemp.horario} onChange={(e) => setDisponibilidadeTemp({...disponibilidadeTemp, horario: e.target.value})}>
              <option value="">Horário</option>
              {horarios.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <button type="button" className={styles.btnAdd} onClick={adicionarDisponibilidade}>+ Adicionar</button>
          </div>
          <div className={styles.horariosLista}>
            {formData.disponibilidade.map(d => (
              <div key={d.dia} className={styles.diaHorario}>
                <strong>{d.dia}:</strong> 
                {d.horarios.map(h => (
                  <span key={h} className={styles.horarioTag}>
                    {h} <button type="button" onClick={() => removerHorario(d.dia, h)}>x</button>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Descrição profissional *</label>
          <textarea name="descricao" rows="4" value={formData.descricao} onChange={handleChange}></textarea>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.termos}>
            <input type="checkbox" required id="termos" />
            <label htmlFor="termos">Declaro que as informações são verdadeiras, estou de acordo com o Código de Ética do CFP e autorizo a divulgação conforme a LGPD.</label>
          </div>
        </div>

        <button type="submit" className={styles.btnSubmit} disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar e Aguardar Validação'}
        </button>
      </form>
    </div>
  );
}