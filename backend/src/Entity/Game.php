<?php

// Namespace de l'entité dans le projet Symfony.
namespace App\Entity;

// Repository associé à l'entité Game.
use App\Repository\GameRepository;

// Collections Doctrine utilisées pour gérer les relations OneToMany.
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

// ORM permet d’utiliser les attributs Doctrine pour mapper la classe en table SQL.
use Doctrine\ORM\Mapping as ORM;

// Déclare cette classe comme entité Doctrine liée au GameRepository.
#[ORM\Entity(repositoryClass: GameRepository::class)]
class Game
{
    // Constantes utilisées pour éviter d'écrire les types de jeux en dur partout.
    const TYPE_ASSOCIATION = 'association';
    const TYPE_CROSSWORD = 'crossword';
    const TYPE_FORMULATION = 'formulation';

    // Identifiant unique du jeu en base de données.
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // Type du jeu : association, crossword ou formulation.
    #[ORM\Column(length: 50)]
    private ?string $type = null;

    // Durée du jeu en secondes.
    #[ORM\Column]
    private ?int $duree = 0;

    // Relation ManyToOne :
    // plusieurs jeux peuvent appartenir à une même session.
    #[ORM\ManyToOne(inversedBy: 'games')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Session $session = null;

    // Relation OneToMany :
    // un jeu d'association peut avoir plusieurs questions d'association.
    #[ORM\OneToMany(
        targetEntity: AssociationQuestion::class,
        mappedBy: 'game',
        cascade: ['persist', 'remove']
    )]
    private Collection $associationQuestions;

    // Constructeur appelé lors de la création d’un objet Game.
    public function __construct()
    {
        // Initialise la collection pour éviter les erreurs lors des ajouts.
        $this->associationQuestions = new ArrayCollection();
    }

    // Retourne l'identifiant du jeu.
    public function getId(): ?int
    {
        return $this->id;
    }

    // Retourne le type du jeu.
    public function getType(): ?string
    {
        return $this->type;
    }

    // Définit le type du jeu.
    public function setType(string $type): static
    {
        $this->type = $type;
        return $this;
    }

    // Retourne la durée du jeu en secondes.
    public function getDuree(): ?int
    {
        return $this->duree;
    }

    // Définit la durée du jeu en secondes.
    public function setDuree(int $duree): static
    {
        $this->duree = $duree;
        return $this;
    }

    // Retourne la session liée à ce jeu.
    public function getSession(): ?Session
    {
        return $this->session;
    }

    // Associe ce jeu à une session.
    public function setSession(?Session $session): static
    {
        $this->session = $session;
        return $this;
    }

    // Retourne les questions d'association liées à ce jeu.
    public function getAssociationQuestions(): Collection
    {
        return $this->associationQuestions;
    }

    // Ajoute une question d'association au jeu.
    public function addAssociationQuestion(AssociationQuestion $question): static
    {
        // Évite d'ajouter deux fois la même question.
        if (!$this->associationQuestions->contains($question)) {
            $this->associationQuestions->add($question);

            // Met aussi à jour le côté propriétaire de la relation.
            $question->setGame($this);
        }

        return $this;
    }

    // Retire une question d'association du jeu.
    public function removeAssociationQuestion(AssociationQuestion $question): static
    {
        if ($this->associationQuestions->removeElement($question)) {
            // Si la question pointe encore vers ce jeu, on retire le lien.
            if ($question->getGame() === $this) {
                $question->setGame(null);
            }
        }

        return $this;
    }
}