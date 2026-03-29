<?php

namespace App\Entity;

use App\Repository\AssociationQuestionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AssociationQuestionRepository::class)]
class AssociationQuestion
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // Le terme cosmétique à associer (ex: "Humectant")
    #[ORM\Column(length: 150)]
    private ?string $terme = null;

    // Liste des définitions proposées stockée en JSON
    // Format : ["Retient l'eau dans la formule", "Permet de mélanger...", ...]
    #[ORM\Column(type: 'json')]
    private array $definitions = [];

    // La bonne définition parmi celles proposées
    #[ORM\Column(length: 255)]
    private ?string $bonneReponse = null;

    // Relation vers le jeu parent
    #[ORM\ManyToOne(inversedBy: 'associationQuestions')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Game $game = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTerme(): ?string
    {
        return $this->terme;
    }

    public function setTerme(string $terme): static
    {
        $this->terme = $terme;
        return $this;
    }

    public function getDefinitions(): array
    {
        return $this->definitions;
    }

    public function setDefinitions(array $definitions): static
    {
        $this->definitions = $definitions;
        return $this;
    }

    public function getBonneReponse(): ?string
    {
        return $this->bonneReponse;
    }

    public function setBonneReponse(string $bonneReponse): static
    {
        $this->bonneReponse = $bonneReponse;
        return $this;
    }

    public function getGame(): ?Game
    {
        return $this->game;
    }

    public function setGame(?Game $game): static
    {
        $this->game = $game;
        return $this;
    }
}