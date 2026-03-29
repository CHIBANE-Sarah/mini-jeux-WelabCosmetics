<?php

namespace App\Entity;

use App\Repository\GameRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: GameRepository::class)]
class Game
{
    // Les 3 types de jeux possibles dans le projet
    const TYPE_ASSOCIATION = 'association';
    const TYPE_CROSSWORD   = 'crossword';
    const TYPE_FORMULATION = 'formulation';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // Type du jeu : 'association', 'crossword' ou 'formulation'
    #[ORM\Column(length: 50)]
    private ?string $type = null;

    // Relation vers la Session : un jeu appartient à une session
    #[ORM\ManyToOne(inversedBy: 'games')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Session $session = null;

    // Relation vers les questions d'association liées à ce jeu
    #[ORM\OneToMany(
        targetEntity: AssociationQuestion::class,
        mappedBy: 'game',
        cascade: ['persist', 'remove']
    )]
    private Collection $associationQuestions;

    public function __construct()
    {
        $this->associationQuestions = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;
        return $this;
    }

    public function getSession(): ?Session
    {
        return $this->session;
    }

    public function setSession(?Session $session): static
    {
        $this->session = $session;
        return $this;
    }

    public function getAssociationQuestions(): Collection
    {
        return $this->associationQuestions;
    }

    public function addAssociationQuestion(AssociationQuestion $question): static
    {
        if (!$this->associationQuestions->contains($question)) {
            $this->associationQuestions->add($question);
            $question->setGame($this);
        }
        return $this;
    }

    public function removeAssociationQuestion(AssociationQuestion $question): static
    {
        if ($this->associationQuestions->removeElement($question)) {
            if ($question->getGame() === $this) {
                $question->setGame(null);
            }
        }
        return $this;
    }
}