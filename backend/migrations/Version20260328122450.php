<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260328122450 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE crossword_question (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, definition VARCHAR(255) NOT NULL, mot_correct VARCHAR(100) NOT NULL, session_id INTEGER NOT NULL, CONSTRAINT FK_71679620613FECDF FOREIGN KEY (session_id) REFERENCES session (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_71679620613FECDF ON crossword_question (session_id)');
        $this->addSql('CREATE TABLE ingredient (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, nom VARCHAR(100) NOT NULL, categorie VARCHAR(50) NOT NULL, est_correct BOOLEAN NOT NULL, session_id INTEGER NOT NULL, CONSTRAINT FK_6BAF7870613FECDF FOREIGN KEY (session_id) REFERENCES session (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_6BAF7870613FECDF ON ingredient (session_id)');
        $this->addSql('CREATE TABLE participation (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, score_total INTEGER DEFAULT NULL, temps_total INTEGER DEFAULT NULL, user_id INTEGER NOT NULL, session_id INTEGER NOT NULL, CONSTRAINT FK_AB55E24FA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_AB55E24F613FECDF FOREIGN KEY (session_id) REFERENCES session (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_AB55E24FA76ED395 ON participation (user_id)');
        $this->addSql('CREATE INDEX IDX_AB55E24F613FECDF ON participation (session_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE crossword_question');
        $this->addSql('DROP TABLE ingredient');
        $this->addSql('DROP TABLE participation');
    }
}
