<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260329120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajout de la table participation pour stocker les scores des joueurs';
    }

    public function up(Schema $schema): void
    {
        // CORRECTION : le commentaire SQL "--" à l'intérieur de la définition
        // de colonne cassait SQLite. On utilise DEFAULT CURRENT_TIMESTAMP sans commentaire.
        $this->addSql('CREATE TABLE IF NOT EXISTS participation (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            joueur_nom VARCHAR(100) NOT NULL,
            joueur_prenom VARCHAR(100) NOT NULL,
            score INTEGER NOT NULL,
            duree_seconds INTEGER NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            session_id INTEGER NOT NULL,
            CONSTRAINT FK_AB55E24F613FECDF FOREIGN KEY (session_id)
                REFERENCES session (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        )');
        $this->addSql('CREATE INDEX IF NOT EXISTS IDX_AB55E24F613FECDF ON participation (session_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS participation');
    }
}