import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { simulationId, format = 'markdown' } = await req.json();

    if (!simulationId) {
      return Response.json({ error: 'simulationId is required' }, { status: 400 });
    }

    const simulation = await base44.entities.Simulation.get(simulationId);

    if (!simulation) {
      return Response.json({ error: 'Simulation not found' }, { status: 404 });
    }

    let content;
    let filename;
    let mimeType;

    if (format === 'pdf') {
      // For PDF, return markdown and let client handle PDF generation
      content = generateMarkdown(simulation);
      filename = `simulation-${simulation.id}.md`;
      mimeType = 'text/markdown';
    } else {
      // Markdown format
      content = generateMarkdown(simulation);
      filename = `simulation-${simulation.id}.md`;
      mimeType = 'text/markdown';
    }

    // Log the export activity
    await base44.entities.ActivityLog.create({
      action: 'exported_simulation',
      entity_type: 'Simulation',
      entity_id: simulation.id,
      details: { format }
    });

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateMarkdown(simulation) {
  let markdown = `# ${simulation.title}\n\n`;

  markdown += `**Created:** ${new Date(simulation.created_date).toLocaleDateString()}\n`;
  markdown += `**Status:** ${simulation.status || 'draft'}\n\n`;

  markdown += `## Description\n\n${simulation.description}\n\n`;

  if (simulation.roles && simulation.roles.length > 0) {
    markdown += `## Participants & Roles\n\n`;
    simulation.roles.forEach((role) => {
      markdown += `- **${role.participant_name}** (${role.role_name})`;
      if (role.stance) {
        markdown += ` - Stance: ${role.stance}`;
      }
      if (role.key_drivers && role.key_drivers.length > 0) {
        markdown += `\n  - Key Drivers: ${role.key_drivers.join(', ')}`;
      }
      markdown += `\n`;
    });
    markdown += `\n`;
  }

  if (simulation.summary) {
    markdown += `## Summary\n\n${simulation.summary}\n\n`;
  }

  if (simulation.trade_offs && simulation.trade_offs.length > 0) {
    markdown += `## Trade-Offs\n\n`;
    simulation.trade_offs.forEach((tradeoff) => {
      markdown += `### ${tradeoff.description}\n\n`;
      markdown += `**Pros:**\n`;
      tradeoff.pros?.forEach((pro) => {
        markdown += `- ${pro}\n`;
      });
      markdown += `\n**Cons:**\n`;
      tradeoff.cons?.forEach((con) => {
        markdown += `- ${con}\n`;
      });
      markdown += `\n`;
    });
  }

  if (simulation.next_steps && simulation.next_steps.length > 0) {
    markdown += `## Next Steps\n\n`;
    simulation.next_steps.forEach((step) => {
      markdown += `- ${step.step} (Confidence: ${step.confidence_score}%)\n`;
    });
    markdown += `\n`;
  }

  markdown += `---\n\nGenerated on ${new Date().toLocaleString()}`;

  return markdown;
}