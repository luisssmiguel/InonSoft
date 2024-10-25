function updatePlan(plan) {
    const planDescription = document.getElementById('plan-description');
    const planValue = document.getElementById('plan-value');

    if (plan === 'basico') {
        planDescription.innerHTML = `
            <p>Gestão básica de estoque, registro de vendas diário, relatórios simples de vendas, suporte via chat e email, integração com aplicativos de pagamento.</p>
        `;
        planValue.innerText = 'R$ 100';
    } else if (plan === 'avancado') {
        planDescription.innerHTML = `
            <p>Relatórios automatizados e personalizados, gestão avançada de estoque, automação de atendimento com chatbots, módulo de fidelidade de clientes e integração com redes sociais e marketplaces.</p>
        `;
        planValue.innerText = 'R$ 150';
    } else if (plan === 'premium') {
        planDescription.innerHTML = `
            <p>Acesso a todos os recursos avançados, suporte prioritário 24/7, automação completa de campanhas de marketing, gestão centralizada de múltiplas filiais e análises preditivas com machine learning.</p>
        `;
        planValue.innerText = 'R$ 200';
    }
}
