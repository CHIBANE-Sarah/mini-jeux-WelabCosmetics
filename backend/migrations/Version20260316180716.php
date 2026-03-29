<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260316180716 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE participation');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE participation (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, date_participation DATETIME NOT NULL, score INTEGER NOT NULL, joueur_id INTEGER NOT NULL, session_id INTEGER NOT NULL, CONSTRAINT FK_AB55E24FA9E2D76C FOREIGN KEY (joueur_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_AB55E24F613FECDF FOREIGN KEY (session_id) REFERENCES session (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_AB55E24F613FECDF ON participation (session_id)');
        $this->addSql('CREATE INDEX IDX_AB55E24FA9E2D76C ON participation (joueur_id)');
    }
}
