<?php

namespace App\DataFixtures;

use App\Entity\Game;
use App\Entity\Session;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class GameFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $session1 = $this->getReference('session_1', Session::class);
        $session3 = $this->getReference('session_3', Session::class);

        $gameAssociation = new Game();
        $gameAssociation->setType(Game::TYPE_ASSOCIATION);
        $gameAssociation->setSession($session1);
        $manager->persist($gameAssociation);
        $this->addReference('game_association_sess01', $gameAssociation);

        $gameCrossword = new Game();
        $gameCrossword->setType(Game::TYPE_CROSSWORD);
        $gameCrossword->setSession($session1);
        $manager->persist($gameCrossword);
        $this->addReference('game_crossword_sess01', $gameCrossword);

        $gameFormulation = new Game();
        $gameFormulation->setType(Game::TYPE_FORMULATION);
        $gameFormulation->setSession($session3);
        $manager->persist($gameFormulation);
        $this->addReference('game_formulation_sess03', $gameFormulation);

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [SessionFixtures::class];
    }
}
