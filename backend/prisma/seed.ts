import { PrismaClient, Perfil, StatusEncomenda, StatusReserva, StatusOcorrencia } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Users
  const adminSenha = await bcrypt.hash('rovean2024', 10);
  const porteiroSenha = await bcrypt.hash('porteiro123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@rovean.com' },
    update: {},
    create: { nome: 'Síndico Miguel', email: 'admin@rovean.com', senha: adminSenha, perfil: Perfil.ADMIN },
  });

  await prisma.user.upsert({
    where: { email: 'porteiro@rovean.com' },
    update: {},
    create: { nome: 'Porteiro João Silva', email: 'porteiro@rovean.com', senha: porteiroSenha, perfil: Perfil.PORTEIRO },
  });

  // Moradores
  const moradores = [
    { lote: '01', nome: 'Carlos Alberto Mendes', telefone: '(85) 99123-4567', email: 'carlos@email.com', veiculo: 'Toyota Corolla Prata — ABC-1D23', iniciais: 'CA', ativo: true },
    { lote: '02', nome: 'Ana Beatriz Sousa', telefone: '(85) 98765-4321', email: 'ana@email.com', veiculo: 'Honda Civic Preto — DEF-4E56', iniciais: 'AB', ativo: true },
    { lote: '03', nome: 'Fernanda Costa Lima', telefone: '(85) 99234-5678', email: 'fernanda@email.com', veiculo: 'Volkswagen Golf Branco — GHI-7F89', iniciais: 'FC', ativo: true },
    { lote: '04', nome: 'Roberto Alves Neto', telefone: '(85) 98321-6549', email: 'roberto@email.com', veiculo: 'Jeep Compass Cinza — JKL-1G23', iniciais: 'RA', ativo: true },
    { lote: '05', nome: 'Mariana Oliveira', telefone: '(85) 99456-7890', email: 'mariana@email.com', veiculo: 'Fiat Pulse Vermelho — MNO-4H56', iniciais: 'MO', ativo: true },
    { lote: '06', nome: 'Thiago Santos Cruz', telefone: '(85) 98654-3210', email: 'thiago@email.com', veiculo: 'Hyundai Creta Azul — PQR-7I89', iniciais: 'TS', ativo: true },
    { lote: '07', nome: 'Juliana Ferreira', telefone: '(85) 99567-8901', email: 'juliana@email.com', veiculo: 'Toyota Hilux Prata — STU-1J23', iniciais: 'JF', ativo: true },
    { lote: '08', nome: 'Paulo Henrique Gomes', telefone: '(85) 98543-2109', email: 'paulo@email.com', veiculo: 'Chevrolet Onix Preto — VWX-4K56', iniciais: 'PH', ativo: false },
    { lote: '09', nome: 'Larissa Martins', telefone: '(85) 99678-9012', email: 'larissa@email.com', veiculo: 'Nissan Kicks Branco — YZA-7L89', iniciais: 'LM', ativo: true },
    { lote: '10', nome: 'Diego Rocha Barbosa', telefone: '(85) 98432-1098', email: 'diego@email.com', veiculo: 'Ford Bronco Sport Cinza — BCD-1M23', iniciais: 'DR', ativo: true },
    { lote: '11', nome: 'Camila Pereira Lins', telefone: '(85) 99789-0123', email: 'camila@email.com', veiculo: 'Renault Duster Prata — EFG-4N56', iniciais: 'CP', ativo: true },
    { lote: '12', nome: 'Bruno Cavalcante', telefone: '(85) 98210-9876', email: 'bruno@email.com', veiculo: 'Volkswagen T-Cross Azul — HIJ-7O89', iniciais: 'BC', ativo: false },
  ];

  for (const m of moradores) {
    await prisma.morador.upsert({ where: { lote: m.lote }, update: {}, create: m });
  }

  const m1 = await prisma.morador.findUnique({ where: { lote: '01' } });
  const m2 = await prisma.morador.findUnique({ where: { lote: '02' } });
  const m3 = await prisma.morador.findUnique({ where: { lote: '03' } });
  const m4 = await prisma.morador.findUnique({ where: { lote: '04' } });
  const m5 = await prisma.morador.findUnique({ where: { lote: '05' } });
  const m6 = await prisma.morador.findUnique({ where: { lote: '06' } });

  // Encomendas
  const encomendasCount = await prisma.encomenda.count();
  if (encomendasCount === 0) {
    await prisma.encomenda.createMany({
      data: [
        { moradorId: m1!.id, remetente: 'Amazon', transportadora: 'Correios', tipo: 'Caixa', tamanho: 'Médio', status: StatusEncomenda.PENDENTE },
        { moradorId: m2!.id, remetente: 'Mercado Livre', transportadora: 'Mercado Envios', tipo: 'Sacola', tamanho: 'Pequeno', status: StatusEncomenda.PENDENTE },
        { moradorId: m3!.id, remetente: 'Shopee', transportadora: 'Jadlog', tipo: 'Caixa', tamanho: 'Grande', status: StatusEncomenda.PENDENTE },
        { moradorId: m4!.id, remetente: 'iFood', transportadora: 'Motoboy', tipo: 'Sacola', tamanho: 'Pequeno', status: StatusEncomenda.RETIRADA, dataRetirada: new Date() },
        { moradorId: m5!.id, remetente: 'Amazon', transportadora: 'Loggi', tipo: 'Envelope', tamanho: 'Pequeno', status: StatusEncomenda.PENDENTE },
        { moradorId: m6!.id, remetente: 'Shopee', transportadora: 'Correios', tipo: 'Caixa', tamanho: 'Médio', status: StatusEncomenda.RETIRADA, dataRetirada: new Date() },
        { moradorId: m1!.id, remetente: 'Mercado Livre', transportadora: 'Total Express', tipo: 'Envelope', tamanho: 'Pequeno', status: StatusEncomenda.PENDENTE },
        { moradorId: m2!.id, remetente: 'Amazon', transportadora: 'Correios', tipo: 'Caixa', tamanho: 'Grande', status: StatusEncomenda.PENDENTE },
      ],
    });
  }

  // Reservas (current week)
  const today = new Date();
  const reservasCount = await prisma.reserva.count();
  if (reservasCount === 0) {
    const d1 = new Date(today); d1.setDate(today.getDate() + 1);
    const d2 = new Date(today); d2.setDate(today.getDate() + 2);
    const d3 = new Date(today); d3.setDate(today.getDate() + 3);
    await prisma.reserva.createMany({
      data: [
        { moradorId: m1!.id, areaComum: 'Churrasqueira', dataReserva: d1, horarioInicio: '12:00', horarioFim: '16:00', status: StatusReserva.CONFIRMADA },
        { moradorId: m2!.id, areaComum: 'Salão de Festas', dataReserva: d1, horarioInicio: '18:00', horarioFim: '23:00', status: StatusReserva.PENDENTE },
        { moradorId: m3!.id, areaComum: 'Academia', dataReserva: d2, horarioInicio: '06:00', horarioFim: '08:00', status: StatusReserva.CONFIRMADA },
        { moradorId: m4!.id, areaComum: 'Piscina', dataReserva: d2, horarioInicio: '10:00', horarioFim: '12:00', status: StatusReserva.CONFIRMADA },
        { moradorId: m5!.id, areaComum: 'Churrasqueira', dataReserva: d3, horarioInicio: '12:00', horarioFim: '17:00', status: StatusReserva.PENDENTE },
      ],
    });
  }

  // Ocorrências
  const ocorrenciasCount = await prisma.ocorrencia.count();
  if (ocorrenciasCount === 0) {
    await prisma.ocorrencia.createMany({
      data: [
        {
          moradorId: m1!.id, titulo: 'Barulho excessivo à noite', descricao: 'Música alta após 22h no Lote 06', categoria: 'Barulho', urgencia: 'Media',
          status: StatusOcorrencia.ABERTA,
          historico: JSON.stringify([{ data: new Date().toISOString(), texto: 'Ocorrência registrada pelo morador.' }])
        },
        {
          moradorId: m2!.id, titulo: 'Vazamento na área comum', descricao: 'Vazamento na torneira da piscina', categoria: 'Manutenção', urgencia: 'Alta',
          status: StatusOcorrencia.EM_ANDAMENTO,
          historico: JSON.stringify([
            { data: new Date(Date.now() - 86400000).toISOString(), texto: 'Ocorrência registrada.' },
            { data: new Date().toISOString(), texto: 'Equipe de manutenção acionada.' }
          ])
        },
        {
          moradorId: m3!.id, titulo: 'Lâmpada queimada no corredor', descricao: 'Corredor do bloco B sem iluminação', categoria: 'Elétrica', urgencia: 'Baixa',
          status: StatusOcorrencia.RESOLVIDA,
          historico: JSON.stringify([
            { data: new Date(Date.now() - 172800000).toISOString(), texto: 'Ocorrência registrada.' },
            { data: new Date(Date.now() - 86400000).toISOString(), texto: 'Manutenção agendada.' },
            { data: new Date().toISOString(), texto: 'Lâmpada substituída. Problema resolvido.' }
          ])
        },
        {
          titulo: 'Problema na cancela', descricao: 'Cancela de entrada travando com frequência', categoria: 'Segurança', urgencia: 'Alta',
          status: StatusOcorrencia.ABERTA,
          historico: JSON.stringify([{ data: new Date().toISOString(), texto: 'Ocorrência registrada pela portaria.' }])
        },
        {
          moradorId: m4!.id, titulo: 'Infiltração no subsolo', descricao: 'Água entrando pelo teto do subsolo quando chove', categoria: 'Manutenção', urgencia: 'Alta',
          status: StatusOcorrencia.EM_ANDAMENTO,
          historico: JSON.stringify([
            { data: new Date(Date.now() - 259200000).toISOString(), texto: 'Ocorrência registrada.' },
            { data: new Date(Date.now() - 172800000).toISOString(), texto: 'Vistoria realizada pela administração.' },
            { data: new Date().toISOString(), texto: 'Aguardando orçamento da empresa terceirizada.' }
          ])
        },
        {
          moradorId: m5!.id, titulo: 'Entulho na vaga de garagem', descricao: 'Materiais de construção abandonados na vaga 15', categoria: 'Limpeza', urgencia: 'Baixa',
          status: StatusOcorrencia.ABERTA,
          historico: JSON.stringify([{ data: new Date().toISOString(), texto: 'Ocorrência registrada.' }])
        },
      ],
    });
  }

  // Acessos
  const acessosCount = await prisma.acesso.count();
  if (acessosCount === 0) {
    const yesterday = new Date(Date.now() - 86400000);
    await prisma.acesso.createMany({
      data: [
        { moradorId: m1!.id, nomeVisitante: 'Pedro Silva', lote: '01', tipo: 'QR Code', status: 'autorizado', motivoVisita: 'Visita familiar', dataEntrada: new Date(new Date(yesterday).setHours(9, 30)), dataSaida: new Date(new Date(yesterday).setHours(11, 0)) },
        { nomeVisitante: 'Maria Joaquina', lote: '03', tipo: 'Manual', status: 'autorizado', motivoVisita: 'Prestador de serviço', dataEntrada: new Date(new Date(yesterday).setHours(10, 0)), dataSaida: new Date(new Date(yesterday).setHours(12, 30)) },
        { nomeVisitante: 'João Desconhecido', lote: '07', tipo: 'Manual', status: 'negado', motivoVisita: 'Vendas', dataEntrada: new Date(new Date(yesterday).setHours(14, 0)) },
        { moradorId: m2!.id, nomeVisitante: 'Carla Fernandes', lote: '02', tipo: 'QR Code', status: 'autorizado', motivoVisita: 'Amigo', dataEntrada: new Date(new Date(yesterday).setHours(15, 30)), dataSaida: new Date(new Date(yesterday).setHours(18, 0)) },
        { nomeVisitante: 'Técnico NET', lote: '05', tipo: 'Manual', status: 'autorizado', motivoVisita: 'Manutenção internet', dataEntrada: new Date(new Date(yesterday).setHours(16, 0)), dataSaida: new Date(new Date(yesterday).setHours(17, 30)) },
        { moradorId: m3!.id, nomeVisitante: 'Lucas Rodrigues', lote: '03', tipo: 'QR Code', status: 'autorizado', motivoVisita: 'Visita', dataEntrada: new Date() },
        { nomeVisitante: 'Entregador iFood', lote: '06', tipo: 'Manual', status: 'autorizado', motivoVisita: 'Entrega', dataEntrada: new Date(Date.now() - 3600000), dataSaida: new Date(Date.now() - 3500000) },
        { nomeVisitante: 'Desconhecido', lote: '10', tipo: 'Manual', status: 'negado', dataEntrada: new Date(Date.now() - 7200000) },
        { moradorId: m4!.id, nomeVisitante: 'Renata Alves', lote: '04', tipo: 'QR Code', status: 'autorizado', motivoVisita: 'Familiar', dataEntrada: new Date(Date.now() - 5400000) },
        { nomeVisitante: 'Técnico Elevator', lote: 'CONDOMÍNIO', tipo: 'Manual', status: 'autorizado', motivoVisita: 'Manutenção elevador', dataEntrada: new Date(Date.now() - 10800000), dataSaida: new Date(Date.now() - 7200000) },
      ],
    });
  }

  console.log('Seed completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
