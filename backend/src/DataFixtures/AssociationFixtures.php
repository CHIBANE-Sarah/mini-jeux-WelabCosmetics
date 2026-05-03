<?php

namespace App\DataFixtures;

use App\Entity\AssociationQuestion;
use App\Entity\Game;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class AssociationFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $game = $this->getReference('game_association_sess01', Game::class);

        $questions = [
            [
                'terme'        => 'Conservateur',
                'definitions'  => [
                    'Protège le produit des microorganismes',
                    'Retient l\'eau dans la formule',
                    'Permet de mélanger l\'eau et l\'huile',
                    'Prévient l\'oxydation des ingrédients',
                    'Diminue la tension superficielle',
                ],
                'bonneReponse' => 'Protège le produit des microorganismes',
            ],
            [
                'terme'        => 'Humectant',
                'definitions'  => [
                    'Protège le produit des microorganismes',
                    'Retient l\'eau dans la formule',
                    'Permet de mélanger l\'eau et l\'huile',
                    'Prévient l\'oxydation des ingrédients',
                    'Diminue la tension superficielle',
                ],
                'bonneReponse' => 'Retient l\'eau dans la formule',
            ],
            [
                'terme'        => 'Antioxydant',
                'definitions'  => [
                    'Protège le produit des microorganismes',
                    'Retient l\'eau dans la formule',
                    'Permet de mélanger l\'eau et l\'huile',
                    'Prévient l\'oxydation des ingrédients',
                    'Diminue la tension superficielle',
                ],
                'bonneReponse' => 'Prévient l\'oxydation des ingrédients',
            ],
            [
                'terme'        => 'Émulsifiant',
                'definitions'  => [
                    'Protège le produit des microorganismes',
                    'Retient l\'eau dans la formule',
                    'Permet de mélanger l\'eau et l\'huile',
                    'Prévient l\'oxydation des ingrédients',
                    'Diminue la tension superficielle',
                ],
                'bonneReponse' => 'Permet de mélanger l\'eau et l\'huile',
            ],
            [
                'terme'        => 'Tensioactif',
                'definitions'  => [
                    'Protège le produit des microorganismes',
                    'Retient l\'eau dans la formule',
                    'Permet de mélanger l\'eau et l\'huile',
                    'Prévient l\'oxydation des ingrédients',
                    'Diminue la tension superficielle',
                ],
                'bonneReponse' => 'Diminue la tension superficielle',
            ],
        ];

        foreach ($questions as $data) {
            $question = new AssociationQuestion();
            $question->setTerme($data['terme']);
            $question->setDefinitions($data['definitions']);
            $question->setBonneReponse($data['bonneReponse']);
            $question->setGame($game);
            $manager->persist($question);
        }

        $manager->flush();
    }

    // CORRECTION : dépend de SessionFixtures (pas UserFixtures)
    // pour avoir accès au jeu association
    public function getDependencies(): array
    {
        return [GameFixtures::class];
    }
}